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
const jwt = require("jsonwebtoken");

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

app.get('/status', async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) { 
            return res.status(200).json({ status: 'unknown' }); 
        }
        
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            
            if (!decoded || !decoded.username) { 
                return res.status(200).json({ status: 'unknown' }); 
            }
            
            const matchingUser = await usersCollection.findOne({ username: decoded.username });
            if (matchingUser) {
                res.status(200).json({ status: matchingUser.status });
            } else {
                res.status(200).json({ status: 'unknown' });
            }
        } catch (jwtError) {
            return res.status(200).json({ status: 'unknown' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

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
        // Verify the JWT token first         
        const token = req.cookies.token;         
        if (!token) {             
            return res.redirect('/login');         
        }          

        console.log("Routing to user page");
        res.sendFile(path.join(__dirname, '../public/user/index.html'));
    } catch (error) {
        console.error("Error in /user route:", error);
        res.redirect('/login');
    } 
});

app.get('/backwork', (req, res) => {
	console.log("backwork route")
	res.sendFile(path.join(__dirname, '../public/backwork/index.html'))
})

app.get('/courses', (req, res) => {
	console.log("courses route")
	res.sendFile(path.join(__dirname, '../public/courses/index.html'))
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
        console.error("Error occurred:", error);  // Log the error
        res.status(500).send({ message: "An error occurred", error: error.message });
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

app.delete('/remove-file/:courseCode/:fileName', async (req, res) => {
    try {
        const { courseCode, fileName } = req.params;
        
        if (!courseCode || !fileName) {
            return res.status(400).json({
                success: false,
                message: 'Course code and file name are required'
            });
        }

        const statusData = await usersCollection.findOne({ username: req.user.username });
        console.log(req.user.username);
        console.log(statusData);
        if (!statusData) {
            return res.status(403).json({
                status: "fail",
                message: "Unauthorized: Cannot Identify User"
            });
        }

        if (!statusData.status === "admin") {
            return res.status(403).json({
                status: "fail",
                message: "Unauthorized: Admin access required"
            });
        }
        
        const courseCollection = database.collection("Classes");
        
        const course = await courseCollection.findOne({ CourseID: courseCode.toUpperCase() });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Course ${courseCode} not found`
            });
        }
        
        const docIndex = course.documents.findIndex(doc => doc.file_name === fileName);
        if (docIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `File ${fileName} not found in course ${courseCode}`
            });
        }
        
        await courseCollection.updateOne(
            { CourseID: courseCode.toUpperCase() },
            { $pull: { documents: { file_name: fileName } } }
        );
        
        // Delete the physical file
        const filePath = path.resolve(__dirname, '..', 'assignments', fileName);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.warn(`File ${fileName} not found in the filesystem, but was removed from the database`);
        }
        
        return res.status(200).json({
            success: true,
            message: `File ${fileName} has been successfully removed from course ${courseCode}`
        });
        
    } catch (error) {
        console.error('Error removing file:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while removing file',
            error: error.message
        });
    }
});

// =======================================================
//  admin page w/ privilaged functionality 
// =======================================================

app.put("/addCourse", async (req, res) => {
    try {
        // Check user authentication and admin status
        const statusData = await usersCollection.findOne({ username: req.user.username });
        console.log(req.user.username);
        console.log(statusData);
        if (!statusData) {
            return res.status(403).json({
                status: "fail",
                message: "Unauthorized: Cannot Identify User"
            });
        }

        if (!statusData.status === "admin") {
            return res.status(403).json({
                status: "fail",
                message: "Unauthorized: Admin access required"
            });
        }

        const courseData = req.body;

        const validationError = validateCourseObject(courseData);
        if (validationError) {
            return res.status(400).json({
                status: "fail",
                message: validationError
            });
        }

        const existingCourse = await courseCollection.findOne({ CourseID: courseData.CourseID });

        if (existingCourse) {
            const updateResult = await courseCollection.updateOne(
                { CourseID: courseData.CourseID },
                { $set: courseData }
            );

            return res.status(200).json({
                status: "success",
                message: "Course updated successfully",
                courseId: existingCourse._id,
                data: courseData
            });
        } else {
            const result = await courseCollection.insertOne(courseData);
            return res.status(201).json({
                status: "success",
                message: "Course added successfully",
                courseId: result.insertedId,
                data: courseData
            });
        }
    } catch (error) {
        console.error("Error in addCourse:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error"
        });
    }
});
function validateCourseObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return "Invalid course object";
    }

    if (typeof obj.CourseID !== 'string' || !/^[A-Z]{2,4}-\d{4}$/.test(obj.CourseID)) {
        return "Invalid CourseID format. Must be XXXX-XXXX";
    }

    if (!Array.isArray(obj.documents)) {
        return "documents must be an array";
    }

    if (typeof obj.history !== 'object' || obj.history === null) {
        return "Invalid history object";
    }

    if (typeof obj.history.courseName !== 'string' || obj.history.courseName.trim() === '') {
        return "Invalid or missing courseName";
    }
    if (!Array.isArray(obj.history.semestersOffered)) {
        return "semestersOffered must be an array";
    }

    if (typeof obj.history.currentTimeSlots !== 'object' || obj.history.currentTimeSlots === null) {
        return "Invalid currentTimeSlots object";
    }

    if (typeof obj.history.semestersAvailable !== 'object' || obj.history.semestersAvailable === null) {
        return "Invalid semestersAvailable object";
    }

    const thoughts = obj.thoughts;
    if (typeof thoughts !== 'object' || thoughts === null) {
        return "Invalid thoughts object";
    }

    const requiredThoughtProps = ['score', 'average', 'reviewCount', 'reviews'];
    for (let prop of requiredThoughtProps) {
        if (!(prop in thoughts)) {
            return `Missing ${prop} in thoughts`;
        }
    }

    if (typeof thoughts.score !== 'number' ||
        typeof thoughts.average !== 'number' ||
        typeof thoughts.reviewCount !== 'number' ||
        !Array.isArray(thoughts.reviews)) {
        return "Invalid thoughts properties types";
    }

    return null;
}

// =======================================================
//  Rest of framework functionality 
// =======================================================

if (!fs.existsSync(dummyWork)) {
    console.error(`Error: Directory ${dummyWork} does not exist`);
    process.exit(1);
}

app.listen(port, () => {
    console.log('Listening on *:3000');
    console.log(`process.env.BASE_URL: ${process.env.BASE_URL}`);
});

process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});