// server.js
const cookieParser = require("cookie-parser");
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const path = require('path');
const { PDFDocument } = require('pdf-lib'); 
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const { cookieAuth } = require("./middleware/cookieAuth");
const dummyData = require('./data/DummyDisplay.json');
const dummyWork = path.join(__dirname, '../assignments');

require('dotenv').config();
const app = express();
const port = 3000;

// const client = new MongoClient(process.env.MONGODB);

// async function connectToMongo() {
//   try {
//     await client.connect();
//     console.log('Connected to MongoDB');
    
//     app.locals.db = client.db(); 
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//   }
// }

// connectToMongo();

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

app.get('/user', (req, res) => {
	console.log("user route")
	res.sendFile(path.join(__dirname, '../public/user/index.html'))
})

app.get('/admin', (req, res) => {
	console.log("admin route")
	res.sendFile(path.join(__dirname, '../public/admin/index.html'))
})

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

app.get('/userData', (req, res) => {
	res.status(200).send(req.user)
})

app.delete("/logout", (req, res) => {
	if (!req.user) {
		res.status(401).send("No user present to logout.")
	}
	res.clearCookie("token")
	res.status(200).send("User successfully logged out.")
})

// =======================================================
//  Course Pages Backend Functionality for API requests
// =======================================================

app.get('/courses', (req, res) => {
    try {
      const { courses } = dummyData;
      
      const sortedCourses = Object.keys(courses).sort();
      
      const formattedData = {
        courses: {}
      };
      
      sortedCourses.forEach(courseId => {
        formattedData.courses[courseId] = {
          history: courses[courseId].history,
          thoughts: courses[courseId].thoughts
        };
      });
  
      res.json(formattedData);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Failed to process the request' });
    }
  });

  app.get('/courses/:season', (req, res) => {
    try {
      const { courses } = dummyData;
      const { season } = req.params;
      
      const sortedCourses = Object.keys(courses).sort();
      
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
      
      sortedCourses.forEach(courseId => {
        if (!courses[courseId] || !courses[courseId].history) {
          console.error(`Course ${courseId} is missing data structure`);
          formattedData.courses[courseId] = {
            courseName: "Unknown",
            Professor: "TBD"
          };
          return;
        }
        
        const courseName = courses[courseId].history.courseName || "Unknown";
        let professor = "TBD";
        
        const availableSemesters = courses[courseId].history.semestersAvailable;
        if (availableSemesters) {
          const semesterKey = `${semester} ${currentYear}`;
          if (availableSemesters[semesterKey]) {
            professor = availableSemesters[semesterKey];
          }
        }
        
        formattedData.courses[courseId] = {
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
//  Downloading Functionality for Backwork Page
// =======================================================

app.get('/AssignmentsStored', (req, res) => {
    res.json(dummyData);
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(dummyWork, filename);
    
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).send('File not found');
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
        
        if (uploadedFile.mimetype !== 'application/pdf') {
            return res.status(400).json({
                success: false,
                message: 'Only PDF files are allowed'
            });
        }

        try {
            await PDFDocument.load(uploadedFile.data);
        } catch (pdfError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid PDF file: ' + pdfError.message
            });
        }

        let coursesData = dummyData;
        const dataFilePath = path.join(__dirname, 'data', 'DummyDisplay.json');
        
        if (!coursesData || typeof coursesData !== 'object' || !coursesData.courses) {
            return res.status(500).json({
                success: false,
                message: 'Invalid data structure in DummyDisplay.json'
            });
        }

        const fileName = uploadedFile.name;
        const filePath = path.join(dummyWork, fileName);

        if (!fs.existsSync(dummyWork)) {
            fs.mkdirSync(dummyWork, { recursive: true });
            console.log(`Created assignments directory at: ${dummyWork}`);
        }

        if (fs.existsSync(filePath)) {
            return res.status(400).json({
                success: false,
                message: 'A file with this name already exists. Please rename your file before uploading.'
            });
        }

        const newDocument = {
            document_name: documentName,
            assignment_type: assignmentType,
            professor: professor,
            date_assigned: semesterAssigned,
            file_name: fileName
        };

		const history = {
			courseName: courseCode,
			semestersOffered:[],
            currentTimeSlots:{},
			semestersAvailable:{}
		};
     
        const thoughts ={
            "score": 0,
            "optimal": 0,
            "reviewCount": 0,
            "reviews":{}
        }; 

        if (!coursesData.courses[courseCode]) {
            coursesData.courses[courseCode] = {
            documents: [newDocument],
            history: history,
            thoughts: thoughts
            };
        } else {
            const isDuplicate = coursesData.courses[courseCode].documents.some(doc => 
                doc.document_name === documentName && 
                doc.professor === professor && 
                doc.date_assigned === semesterAssigned
            );

            if (isDuplicate) {
                return res.status(400).json({
                    success: false,
                    message: 'This document already exists for this course'
                });
            }

            coursesData.courses[courseCode].documents.push(newDocument);
        }

        try {
            const dirPath = path.join(__dirname, 'data');
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            
            await uploadedFile.mv(filePath);
            
            fs.writeFileSync(dataFilePath, JSON.stringify(coursesData, null, 4));
            
            res.status(200).json({
                success: true,
                message: 'Document uploaded and added to course successfully',
                document: newDocument,
                courseCode: courseCode
            });
        } catch (error) {
            console.error('Error in file upload or database update:', error);
            
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (cleanupError) {
                    console.error('Error cleaning up file after failed operation:', cleanupError);
                }
            }
            
            return res.status(500).json({
                success: false,
                message: 'Error processing upload. Changes have been rolled back.'
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file: ' + error.message
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
  console.log('MongoDB connection closed');
  process.exit(0);
});