let url = "";

url = /*"https://course-vault.eastus.cloudapp.azure.com/node"*/"http://localhost:3000";


document.addEventListener('DOMContentLoaded', function() {

    determineStatus();

    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileUpload');
    const submitButton = uploadForm.querySelector('button[type="submit"]');
    
    fileInput.removeAttribute('multiple');
    
    uploadForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const courseCode = document.getElementById('courseCode').value;
        const documentName = document.getElementById('documentName').value;
        const assignmentType = document.getElementById('assignmentType').value;
        const professor = document.getElementById('professor').value;
        const semesterAssigned = document.getElementById('semesterAssigned').value;
        const file = fileInput.files[0];
        
        const courseCodePattern = /^[A-Z]{4}-\d{4}$/;
        if (!courseCodePattern.test(courseCode)) {
            alert('Course code must be in the format LLLL-NNNN where L is letters and N is numbers');
            return;
        }
        
        if (!file) {
            alert('Please select a PDF file to upload');
            return;
        }

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.pdf')) {
            alert('Only PDF files are allowed');
            return;
        }
        
        if (file.type !== 'application/pdf') {
            alert('Only PDF files are allowed');
            return;
        }
        
        const formData = new FormData();
        formData.append('courseCode', courseCode);
        formData.append('documentName', documentName);
        formData.append('assignmentType', assignmentType);
        formData.append('professor', professor);
        formData.append('semesterAssigned', semesterAssigned);
        formData.append('pdfFile', file);
        
        try {
            submitButton.textContent = 'Uploading...';
            submitButton.disabled = true;
            
            const response = await fetch(`${url}/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            const result = await response.json();
            
            submitButton.textContent = 'Upload';
            submitButton.disabled = false;
            
            if (result.success) {
                alert('Document uploaded successfully!');
                uploadForm.reset();
            } else {
                alert(result.message || 'Failed to upload document');
            }
        } catch (error) {
            submitButton.textContent = 'Upload';
            submitButton.disabled = false;
            console.error('Upload error:', error);
            alert('An error occurred during upload');
            
            
        }
    });
});

function determineStatus() {
    return fetch(`${url}/status`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'unknown') {
          window.location.href = `/index.html`;
        }
        return;
      })
      .catch(error => {
        console.error('Error checking user status:', error);
        window.location.href = `/index.html`;
        return;
      });
}