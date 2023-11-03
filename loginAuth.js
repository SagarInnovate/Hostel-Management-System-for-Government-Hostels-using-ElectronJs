    const { ipcMain } = require('electron');

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const excel4node = require('excel4node');
const configPath = path.join(__dirname, 'config.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const totalRooms = configData.constantData.totalRooms;
const reservedRooms = configData.constantData.reservedRooms;

const db = new sqlite3.Database('hostel.db');


ipcMain.on('login-request', (event, username, password) => {
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            event.reply('login-response', { success: false, message: 'Database error.' });
        } else if (!row) {
            event.reply('login-response', { success: false, message: 'Invalid username or password.' });
        } else {
            event.reply('login-response', { success: true, message: 'Login successful.' });
        }
    });
});

ipcMain.on('fetch-student-data-request', (event) => {
    db.all('SELECT * FROM student', (err, rows) => {
        if (err) {
            console.error('Error fetching user data:', err);
            event.reply('fetch-student-data-response', []);
        } else {
            event.reply('fetch-student-data-response', rows);
        }
    });
});

ipcMain.on('fetch-room-data-request', (event) => {
    db.all('SELECT * FROM rooms', async (err, roomRows) => {
      if (err) {
        console.error('Error fetching Room data:', err);
        event.reply('fetch-room-data-response', []);
      } else {
        // Create an array to store Promises for fetching student data
        const studentPromises = roomRows.map((room) => {
          return fetchStudentDataForRoom(room.roomNo)
            .then((studentData) => {
              room.studentsIDs = studentData.studentIds;
              room.totalStudents = studentData.totalStudents;
              return room; // Return the updated room object
            })
            .catch((error) => {
              console.error('Error fetching student data for room:', error);
              room.studentsIDs = [];
              room.totalStudents = 0;
              return room; // Return the room object even if there's an error
            });
        });
  
        // Wait for all Promises to resolve
        Promise.all(studentPromises)
          .then((roomsWithStudentData) => {
            event.reply('fetch-room-data-response', roomsWithStudentData);
          })
          .catch((error) => {
            console.error('Error fetching student data for rooms:', error);
            event.reply('fetch-room-data-response', roomRows); // Send the original room data in case of an error
          });
      }
    });
  });
  
  
  // Function to fetch student data and count for a specific room
  async function fetchStudentDataForRoom(roomNo) {
    return new Promise((resolve, reject) => {
      db.all('SELECT admissionId FROM student WHERE room = ?', [roomNo], (err, studentRows) => {
        if (err) {
          reject(err);
        } else {
          const studentIds = studentRows.map(row => row.admissionId);
          const totalStudents = studentIds.length;
          resolve({ studentIds, totalStudents });
        }
      });
    });
  }
  
  

ipcMain.on('upload-profile-photo-request', (event, filePath) => {
    const profilePhotoPath = path.join(__dirname, 'student-profile'); // Adjust the path
    const uniqueFileName = `${Date.now()}${path.extname(filePath)}`;
    const imagePath = path.join(profilePhotoPath, uniqueFileName);

    fs.copyFile(filePath, imagePath, (err) => {
        if (err) {
            console.error('Error uploading profile photo:', err);
            event.reply('upload-profile-photo-response', '');
        } else {
            console.log('Profile photo uploaded successfully:', imagePath);
            event.reply('upload-profile-photo-response', imagePath);
        }
    });
});




ipcMain.on('insert-student-data-request', (event, formData) => {
    const { personalData, emergencyData, educationData, contactData } = formData;

    // Convert form data arrays back to objects
    const personalDataObject = Object.fromEntries(personalData);
    const emergencyDataObject = Object.fromEntries(emergencyData);
    const educationDataObject = Object.fromEntries(educationData);
    const contactDataObject = Object.fromEntries(contactData);


    db.run(
        'INSERT INTO student (name, room, admissionId, phone, email,  gender, eduCategory, eduCourse, eduYear, address, village, talukaDistrict, pin, emeName, emeRelation, emePhone, user, profile_photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [personalDataObject.name,personalDataObject.roomNo,personalDataObject.admissionId,personalDataObject.phone,personalDataObject.email,personalDataObject.gender,educationDataObject.eduCategory,educationDataObject.eduCourse,educationDataObject.eduYear,contactDataObject.address,contactDataObject.village,contactDataObject.talukaDistrict,contactDataObject.pin,emergencyDataObject.emeName,emergencyDataObject.emeRelation,emergencyDataObject.emePhone ,personalDataObject.user,personalDataObject.profile],
        function (err) {
            if (err) {
                console.error('Error inserting student data:', err);
                event.reply('insert-student-data-response', { success: false, message: 'Error inserting student data.' });
            } else {
                event.reply('insert-student-data-response', { success: true, message: 'Student data inserted successfully.' });
            }
        }
    );
});

ipcMain.on('insert-room-data-request', (event, formData) => {
    const { rooomData } = formData;

    // Convert form data arrays back to objects
    const roomDataObject = Object.fromEntries(rooomData);
   

    db.run(
        'INSERT INTO rooms (roomNo, floorNo, tables, chairs, buckets,  studentId, tag, students, user) VALUES (?, ?, ?,?, ?, ?,?, ?, ?)',
        [roomDataObject.roomNo,roomDataObject.floorNo,roomDataObject.tables,roomDataObject.chairs,roomDataObject.buckets,roomDataObject.studentId,roomDataObject.tag,roomDataObject.students,roomDataObject.user,],
        function (err) {
            if (err) {
                console.error('Error inserting room data:', err);
                event.reply('insert-room-data-response', { success: false, message: 'Error inserting room data.' });
            } else {
                event.reply('insert-room-data-response', { success: true, message: 'room data inserted successfully.' });
            }
        }
    );
});


ipcMain.on('get-dashboard-data-request', (event) => {
    db.get('SELECT COUNT(*) AS totalStudents FROM student', (err, row) => {
        if (err) {
            console.error('Error fetching total students:', err);
            event.reply('get-dashboard-data-response', null);
        } else {
            const totalStudents = row.totalStudents;
            const studentsPerRoom = 4; 
            const totalSeats = totalRooms * studentsPerRoom;
const fullRooms = Math.ceil(totalStudents / studentsPerRoom); // Number of rooms with all seats occupied
const emptySeats = totalSeats-totalStudents; // Number of rooms with available seats


            const dashboardData = {
                totalStudents,
                emptySeats,
                fullRooms,
                reservedRooms
            };

            event.reply('get-dashboard-data-response', dashboardData);
        }
    });
});


// Fetch education progress data from the student table
ipcMain.on('get-education-progress-request', (event) => {
    db.all('SELECT eduCategory FROM student', (err, rows) => {
        if (err) {
            console.error('Error fetching education progress data:', err);
            event.reply('get-education-progress-response', null);
        } else {
            const educationCounts = {
                '11th-12th': 0,
                'graduation': 0,
                'post-graduation': 0,
                'professional': 0
            };

            // Count education categories
            rows.forEach((row) => {
                const eduCategory = row.eduCategory;
                educationCounts[eduCategory] += 1;
            });

            const totalStudents = rows.length;

            // Calculate progress percentages
            const progressData = {};
            for (const category in educationCounts) {
               

                const count = educationCounts[category];
                const percentage = ((count / totalStudents) * 100).toFixed(2); // Limit to 2 decimal places
                progressData[category] = parseFloat(percentage);
            }

            event.reply('get-education-progress-response', progressData);
        }
    });
});



ipcMain.on('generate-excel-report-request', (event) => {
    const workbook = new excel4node.Workbook();
    const worksheet = workbook.addWorksheet('Student Data Report');

    // Fetch student data from the student table
    db.all('SELECT * FROM student', (err, rows) => {
        if (err) {
            console.error('Error fetching student data:', err);
            event.reply('generate-excel-report-response', null);
        } else {
            // Create headers
            const headers = Object.keys(rows[0]);
            headers.forEach((header, index) => {
                worksheet.cell(1, index + 1).string(header);
            });

            // Add data rows
            rows.forEach((row, rowIndex) => {
                Object.values(row).forEach((value, columnIndex) => {
                    worksheet.cell(rowIndex + 2, columnIndex + 1).string(value.toString());
                });
            });

            const reportFilePath = path.join(__dirname, 'export/student_report.xlsx');
            
            // Save the workbook to a file
            workbook.write(reportFilePath);

            event.reply('generate-excel-report-response', reportFilePath);
        }
    })});




    ipcMain.on('generate-room-excel-report-request', (event) => {
        const workbook = new excel4node.Workbook();
        const worksheet = workbook.addWorksheet('Student Data Report');
    
        // Fetch student data from the student table
        db.all('SELECT * FROM rooms', (err, rows) => {
            if (err) {
                console.error('Error fetching student data:', err);
                event.reply('generate-room-excel-report-response', null);
            } else {
                // Create headers
                const headers = Object.keys(rows[0]);
                headers.forEach((header, index) => {
                    worksheet.cell(1, index + 1).string(header);
                });
    
                // Add data rows
                rows.forEach((row, rowIndex) => {
                    Object.values(row).forEach((value, columnIndex) => {
                        worksheet.cell(rowIndex + 2, columnIndex + 1).string(value.toString());
                    });
                });
    
                const reportFilePath = path.join(__dirname, 'export/room_report.xlsx');
                
                // Save the workbook to a file
                workbook.write(reportFilePath);
    
                event.reply('generate-room-excel-report-response', reportFilePath);
            }
        });


});


ipcMain.on('fetch-student-data-request-by-ID', (event,admissionId) => {
    db.all('SELECT * FROM student where admissionId=?',[admissionId], (err, rows) => {
        if (err) {
            console.error('Error fetching user data:', err);
            event.reply('fetch-student-data-response-by-ID', []);
        } else {
            event.reply('fetch-student-data-response-by-ID', rows);
            console.log(rows);
        }
    });
});


module.exports = {
    
       
};
