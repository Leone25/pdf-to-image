
function run() {
    log("Loading file . . . ");
    let file = document.getElementById("file").files[0];
    if (!file || file.type != "application/pdf") {
        log("Invalid/Missing input file");
        return;
    }
    var reader = new FileReader();
    reader.onload = async (e) => {
        var contents = e.target.result;
        var loadingTask = pdfjsLib.getDocument(contents);
        loadingTask.promise.then(async (pdf) => {
            var zip = new JSZip();
            for (i = 0;i < pdf.numPages;i++) {
                log(`Processing page ${i+1}/${pdf.numPages}`);
                let page = await pdf.getPage(i+1);
                var viewport = await page.getViewport({scale: document.getElementById('scale').value});

                var canvas = document.getElementById('canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({canvasContext: context,viewport: viewport}).promise;
                
                zip.file(`${i+1}.${document.getElementById('format').value.substring(6)}`, document.getElementById('canvas').toDataURL(document.getElementById('format').value).substring(`data:${document.getElementById('format').value};base64,`.length), {base64: true});
            }
            log("Saving . . .");
            await zip.generateAsync({type:"blob"})
            .then(function(content) {
                let url = window.URL.createObjectURL(content);
                let link = document.createElement('a');
                link.href = url;
                link.download = `${document.getElementById("file").files[0].name.slice(0, -4)}.zip`;
                link.click();
                window.URL.revokeObjectURL(url);
                log("DONE");
            });
        });
        
    };
    reader.readAsArrayBuffer(file);
}

function log(t) {
    document.getElementById("info").innerText = t;
    console.log(t);
}

document.getElementById("go").addEventListener('click', () => {
    document.getElementById("go").disabled = true;

    run();

    document.getElementById("go").disabled = false;
});