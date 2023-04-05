// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    var decodeRadio = document.querySelector('input[name="mode"][value="decode"]');
    if (decodeRadio.checked) {
        toggleFormatOptions();
    }
});

// Main functions
function processFile() {
    const modeInputs = document.getElementsByName("mode");
    const selectedMode = Array.from(modeInputs).find(input => input.checked).value;
    if (selectedMode === 'encode') {
        imageToBase64();
    } else {
        base64ToImage();
    }
}

function toggleFormatOptions() {
    const modeInputs = document.getElementsByName("mode");
    const selectedMode = Array.from(modeInputs).find(input => input.checked).value;
    const formatSelection = document.getElementById("formatSelection");
    formatSelection.style.display = selectedMode === "decode" ? "block" : "none";
}

function updateFileInput() {
    const modeInputs = document.getElementsByName("mode");
    const selectedMode = Array.from(modeInputs).find(input => input.checked).value;
    const fileInput = document.getElementById("fileInput");
    fileInput.accept = selectedMode === "encode" ? "image/*" : "text/plain";
}

// Helper functions
function imageToBase64() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("Please select an image.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        const base64data = reader.result;
        const base64String = base64data.split(',')[1];

        const fileNameParts = file.name.split(".");
        const fileExtension = fileNameParts.pop();
        const base64FileName = fileNameParts.join(".") + "_base64.txt";
        const blob = new Blob([base64String], { type: "text/plain" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = base64FileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    reader.readAsDataURL(file);
}

function base64ToImage() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("Please select a base64-encoded text file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        const base64String = reader.result;
        const image = new Image();
        image.src = 'data:image/png;base64,' + base64String;

        image.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            const formatInputs = document.getElementsByName("format");
            const selectedFormats = Array.from(formatInputs)
                                        .filter(input => input.checked)
                                        .map(input => input.value);

            selectedFormats.forEach((format) => {
                const imgData = canvas.toDataURL(`image/${format}`);

                const fileNameParts = file.name.split(".");
                const fileExtension = fileNameParts.pop();
                const imgFileName = fileNameParts.join(".") + "_img." + format;

                const link = document.createElement('a');
                link.href = imgData;
                link.download = imgFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        };
    };

    reader.readAsText(file);
}
