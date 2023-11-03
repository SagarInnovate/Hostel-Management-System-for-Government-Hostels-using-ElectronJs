

const { contextBridge, ipcRenderer } = require('electron');




contextBridge.exposeInMainWorld('electronAPI', {
    sendLoginRequest: async (username, password) => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('login-request', username, password);

            ipcRenderer.once('login-response', (event, response) => {
                resolve(response);
            });
        });
    },
    
    fetchStudentData: async () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('fetch-student-data-request'); // Modify the channel name
            
            ipcRenderer.once('fetch-student-data-response', (event, studentData) => {
                resolve(studentData);
            });
        });
    },

    fetchRoomData: async () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('fetch-room-data-request'); // Modify the channel name
            
            ipcRenderer.once('fetch-room-data-response', (event, roomData) => {
                resolve(roomData);
            });
        });
    },

    uploadProfilePhoto: async (file) => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('upload-profile-photo-request', file.path);

            ipcRenderer.once('upload-profile-photo-response', (event, imagePath) => {
                resolve(imagePath);
            });
        });
    },
   
        submitStudentData: async (formData) => {
            return new Promise((resolve, reject) => {
                ipcRenderer.send('insert-student-data-request', formData);
    
                ipcRenderer.once('insert-student-data-response', (event, response) => {
                    resolve(response);
                });
            });
        },
        
        submitRoomData: async (formData) => {
            return new Promise((resolve, reject) => {
                ipcRenderer.send('insert-room-data-request', formData);
    
                ipcRenderer.once('insert-room-data-response', (event, response) => {
                    resolve(response);
                });
            });
        },

        getDashboardData: async () => {
            return new Promise((resolve, reject) => {
                ipcRenderer.send('get-dashboard-data-request');
    
                ipcRenderer.once('get-dashboard-data-response', (event, data) => {
                    resolve(data);
                });
            });
        },

        getEducationProgress: async () => {
            return new Promise((resolve, reject) => {
                ipcRenderer.send('get-education-progress-request');
    
                ipcRenderer.once('get-education-progress-response', (event, data) => {
                    resolve(data);
                });
            });
        },


        generateExcelReport: async () => {
            return new Promise((resolve, reject) => {
                ipcRenderer.send('generate-excel-report-request');
    
                ipcRenderer.once('generate-excel-report-response', (event, filePath) => {
                    resolve(filePath);
                });
            });
        },
        showSaveDialog: (filePath) => {
            ipcRenderer.send('show-save-dialog', filePath);
        },

        generateRoomExcelReport: async () => {
            return new Promise((resolve, reject) => {
                ipcRenderer.send('generate-room-excel-report-request');
    
                ipcRenderer.once('generate-room-excel-report-response', (event, filePath) => {
                    resolve(filePath);
                });
            });
        },
        showSaveDialog: (filePath) => {
            ipcRenderer.send('show-save-dialog', filePath);
        },

        getStudentData: async (admissionId) => {
            return new Promise((resolve, reject) => {
                ipcRenderer.send('fetch-student-data-request-by-ID',admissionId); // Modify the channel name
                
                ipcRenderer.once('fetch-student-data-response-by-ID', (event, studentData) => {
                    resolve(studentData);
                });
            });
        },
 
   
   
});



