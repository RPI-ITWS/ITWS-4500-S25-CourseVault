document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileUpload');
    const submitButton = uploadForm.querySelector('button[type="submit"]');
    
    fileInput.removeAttribute('multiple');
    
    fileInput.addEventListener('change', function(event) {
        if (this.files.length > 1) {
            this.value = '';
            alert('Please select only one file at a time');
        }
    });
    
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
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Uploading...';
            submitButton.disabled = true;
            
            const response = await fetch(`${window.location.origin}/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            const result = await response.json();
            
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            
            if (result.success) {
                alert('Document uploaded successfully!');
                uploadForm.reset();
            } else {
                alert(result.message || 'Failed to upload document');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload');
            
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
});