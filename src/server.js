// server.js
const cookieParser = require("cookie-parser");
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const { PDFDocument } = require('pdf-lib'); 
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const { cookieAuth } = require("./middleware/cookieAuth");
const dummyData = require('./data/DummyDisplay.json');
const dummyWork = path.join(__dirname, '../assignments');

require('dotenv').config();
const uri = process.env.MONGODB;

const app = express();
const port = 3000;


const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  async function connectToMongo() {
    try {
      await client.connect();
      console.log("Established Connection To Mongo Database");
      
      app.locals.db = client.db("CourseVault");
      return true;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      return false;
    }
  }

connectToMongo();

const database = client.db("CourseVault");
const usersCollection = database.collection("Users");
const courseCollection = database.collection("Classes");

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())
app.use(express.static('public'))

// =======================================================
//  Unauthenticated Routes
// =======================================================

app.get('/', (req, res) => {
	console.log("root route")
	res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.post("/login", loginRoute)

app.post("/register", registerRoute)

// =======================================================
app.use(cookieAuth)
//  Authenticated Routes (everything below)
// =======================================================

app.get('/login', (req, res) => {
	console.log("login route")
	res.sendFile(path.join(__dirname, '../public/login/index.html'))
})

app.get('/signup', (req, res) => {
	console.log("register route")
	res.sendFile(path.join(__dirname, '../public/signup/index.html'))
})

app.get('/user', async (req, res) => {
    try {
        const matchingUser = await usersCollection.findOne({ username: req.user.username });
        
        if (matchingUser) {
            if (matchingUser.status === "admin") {
                console.log("admin route");
                res.sendFile(path.join(__dirname, '../public/admin/index.html'));
            } else {
                console.log("user route");
                res.sendFile(path.join(__dirname, '../public/user/index.html'));
            }
        } else {
            console.log("user route");
            res.sendFile(path.join(__dirname, '../public/user/index.html'));
        }
    } catch (error) {
        console.log("user route");
        res.sendFile(path.join(__dirname, '../public/user/index.html'));
    }
});

app.get('/backwork', (req, res) => {
	console.log("backwork route")
	res.sendFile(path.join(__dirname, '../public/backwork/index.html'))
})

app.get('/professors', (req, res) => {
	console.log("professors route")
	res.sendFile(path.join(__dirname, '../public/professors/index.html'))
})

app.get('/resources', (req, res) => {
	console.log("resources route")
	res.sendFile(path.join(__dirname, '../public/resources/index.html'))
})

app.get('/schedule', (req, res) => {
	console.log("schedule route")
	res.sendFile(path.join(__dirname, '../public/schedule/index.html'))
})

app.get('/userData', async (req, res) => {
	try {
        const matchingUser = await usersCollection.findOne({ username: req.user.username });

        if (matchingUser) {
            res.status(200).send(matchingUser);
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

app.delete("/logout", (req, res) => {
	if (!req.user) {
		res.status(401).send("No user present to logout.")
	}
	res.clearCookie("token")
	res.status(200).send("User successfully logged out.")
});

// =======================================================
//  Add Review Functionality
// =======================================================

app.post("/addReview", async (req, res) => {
    try {
        const { course, score, comment } = req.body;

        const matchingUser = await usersCollection.findOne({ username: req.user.username });
        const courses = await courseCollection.find().toArray();

        const matchedCourse = courses.find(c => {
            console.log('Comparing:', c.CourseID, 'with', course);
            return c.CourseID.trim() === course.trim();
        });
        
        if (!matchedCourse) {
            console.log('Detailed Course Comparison:', {
                courseFromRequest: course,
                availableCourses: courses.map(c => c.CourseID),
                comparisonResult: courses.map(c => c.CourseID === course)
            });
            return res.status(404).send({
                message: `Course, ${course}, not found`,
                providedCourseId: course
            });
        }

        if (matchingUser) {
            const reviews = matchingUser.course_ratings || [];

            if (reviews.length > 0) {
                const existingReview = reviews.find(review => review.course === course);
                if (existingReview) {
                    return res.status(400).send({ message: 'A review for this course already exists' });
                }
            }

            const newReview = {
                course: course,
                score: parseInt(score),
                comment: comment || "No additional comments"
            };

            const newTotal = matchedCourse.thoughts.score + score;
            const oldAvg = matchedCourse.thoughts.average * matchedCourse.thoughts.reviewCount;
            const newAvg = (oldAvg + score) / (matchedCourse.thoughts.reviewCount + 1);

            await courseCollection.updateOne(
                { CourseID: matchedCourse.CourseID },
                {
                    $set: {
                        'thoughts.score': newTotal,
                        'thoughts.average': newAvg.toPrecision(2),
                        'thoughts.reviewCount': matchedCourse.thoughts.reviewCount + 1
                    },
                    $push: {
                        'thoughts.reviews': comment
                    }
                }
            );

            await usersCollection.updateOne(
                { username: req.user.username },
                { 
                    $push: { 
                        course_ratings: newReview 
                    } 
                }
            );

            res.status(201).send({ 
                message: 'Review added successfully',
                review: newReview 
            });

        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// =======================================================
//  Profile Page Drop Course Functionality
// =======================================================

app.delete("/dropcourse", async (req, res) => {
    try {
        const { course_id } = req.body;
        const matchingUser = await usersCollection.findOne({ username: req.user.username });

        if (matchingUser) {
            matchingUser.courses = matchingUser.courses.filter(course => course !== course_id);

            await usersCollection.updateOne(
                { username: req.user.username },
                { $set: { courses: matchingUser.courses } }
            );

            res.status(200).send({ message: "Course removed successfully" });
        } else {
            res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ message: "An error occurred", error });
    }
});

// =======================================================
//  Course Pages Backend Functionality for API requests
// =======================================================

app.get('/courses', async (req, res) => {
    try {
        const courses = await courseCollection.find().toArray();

        const formattedData = {
            courses: {}
        };

        courses.forEach(course => {
            formattedData.courses[course.CourseID] = {
                history: course.history,
                thoughts: course.thoughts
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to process the request' });
    }
  });

  app.get('/courses/:season', async (req, res) => {
    try {
        const courses = await courseCollection.find().toArray();
        const { season } = req.params;

        const sortedCourses = courses.sort((a, b) => a.CourseID.localeCompare(b.CourseID));

        const formattedData = {
            courses: {}
        };

        let semester = '';
        if (season.toLowerCase().startsWith('sp') || (season.length >= 2 && (season.toLowerCase()[0] === "s" && season.toLowerCase()[1] !== "u"))) {
            semester = 'Spring';
        } else if (season.toLowerCase().startsWith('su')) {
            semester = 'Summer';
        } else if (season.toLowerCase().startsWith('fa') || (season.length >= 1 && season.toLowerCase()[0] === "f")) {
            semester = 'Fall';
        } else {
            semester = 'Spring';
        }

        const currentYear = new Date().getFullYear();

        sortedCourses.forEach(course => {
            const courseName = course.history.courseName || "Unknown";
            let professor = "TBD";

            const availableSemesters = course.history.semestersAvailable;
            if (availableSemesters) {
                const semesterKey = `${semester} ${currentYear}`;
                if (availableSemesters[semesterKey]) {
                    professor = availableSemesters[semesterKey];
                }
            }

            formattedData.courses[course.CourseID] = {
                courseName: courseName,
                Professor: professor
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to process the request' });
    }
});

// =======================================================
//  Dyanmic Course Specific Backend Functionality
// =======================================================

app.get('/class', async (req, res) => {
    try {
        const { course_id } = req.query;
        const course = await courseCollection.findOne({ CourseID: course_id });
        
        if (course) {
            res.json(course);
        } else {
            res.status(404).send({ message: "Course not found" });
        }
    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
});

app.post("/addClass", async (req, res) => {
    try {
        const { course_id } = req.body;
        const matchingUser = await usersCollection.findOne({ username: req.user.username });

        if (matchingUser) {
            if (!matchingUser.courses.includes(course_id)) {
                matchingUser.courses.push(course_id);

                await usersCollection.updateOne(
                    { username: req.user.username },
                    { $set: { courses: matchingUser.courses } }
                );

                res.status(200).send({ message: "Course added successfully" });
            } else {
                res.status(400).send({ message: "Course already in schedule" });
            }
        } else {
            res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ message: "An error occurred", error });
    }
});


// =======================================================
//  Downloading Functionality for Backwork Page
// =======================================================

app.get('/AssignmentsStored', async (req, res) => {
    try {
        const courses = await courseCollection.find({}).toArray();
        const formattedData = {
            courses: {}
        };
        courses.forEach(course => {
            formattedData.courses[course.CourseID] = {
                documents: course.documents
            };
        });
        res.json(formattedData);
    } catch (err) {
        console.error("Error fetching course data from the database:", err);
        res.status(500).send("Error loading assignments");
    }
});

app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;

    try {
        const course = await courseCollection.findOne({"documents.file_name": filename});
        if (!course) return res.status(404).send('File not found in any classes');
        
        const document = course.documents.find(doc => doc.file_name === filename);
        if (!document) return res.status(404).send('File not found in the course documents');

        const filePath = path.resolve(__dirname, '..', 'assignments', filename);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.sendFile(filePath, (err) => {
                if (err) {
                    console.error("Error sending file:", err);
                    res.status(500).send('Internal Server Error');
                }
            });
        } else {
            console.error('File not found at:', filePath);
            return res.status(404).send('File not found');
        }
    } catch (err) {
        console.error("Error fetching course data from the database:", err);
        res.status(500).send('Internal Server Error');
    }
});

// =======================================================
//  Upload Functionality for Uploading Backwork Page
// =======================================================

app.use(fileUpload({
    limits: { fileSize: 10485760 }, /* 10MB limit */
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached (10MB)'
}));

app.post('/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.pdfFile) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const requiredFields = ['documentName', 'assignmentType', 'professor', 'semesterAssigned', 'courseCode'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        const documentName = req.body.documentName;
        const assignmentType = req.body.assignmentType;
        const professor = req.body.professor;
        const semesterAssigned = req.body.semesterAssigned;
        const courseCode = req.body.courseCode.toUpperCase();
        
        const uploadedFile = req.files.pdfFile;
        const originalFileName = uploadedFile.name;

        if (uploadedFile.mimetype !== 'application/pdf') {
            return res.status(400).json({
                success: false,
                message: 'Only PDF files are allowed'
            });
        }
        
        const courseCollection = database.collection("Classes");
        const course = await courseCollection.findOne({ CourseID: courseCode });
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Course ${courseCode} not found`
            });
        }
        
        const filePath = path.join(__dirname, '..', 'assignments', originalFileName);
        
        await uploadedFile.mv(filePath);
        
        const newDocument = {
            document_name: documentName,
            assignment_type: assignmentType,
            professor: professor,
            date_assigned: semesterAssigned,
            file_name: originalFileName 
        };
        
        await courseCollection.updateOne(
            { CourseID: courseCode },
            { $push: { documents: newDocument } }
        );
        
        return res.status(200).json({
            success: true,
            message: 'Document uploaded successfully',
            document: newDocument
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during upload',
            error: error.message
        });
    }
});

// =======================================================
//  Rest of framework functionality 
// =======================================================

if (!fs.existsSync(dummyWork)) {
    console.error(`Error: Directory ${dummyWork} does not exist`);
    process.exit(1);
}

app.listen(port, () => {
    console.log('Listening on *:3000');
    console.log(`Serving assignments from: ${dummyWork}`);
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('\nMongoDB connection closed');
  process.exit(0);
});