function log_print(text) {
    let now = new Date()
    let datestring = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    logbox.innerText = logbox.innerText + `\n[${datestring}] ` + text
    console.log(`Log "[${datestring}] ` + text + '"')
}
logcache.forEach(element => {
    log_print(element)
})
function log_throw(text) {
    log_print(text)
    throw new Error(text);
}

var mod
import("./module.js").then(async modul => {
    await modul.default()
    mod = modul
    log_print('Module loaded')
}).catch(error => {
    log_print(`Failed to module: ${error}`)
})

// Drop file functionality
document.addEventListener('dragover', (e) => {
    inputbox.style.borderColor = 'red'
    e.preventDefault()
    return true
})
document.addEventListener('dragleave', (e) => {
    inputbox.style.borderColor = 'transparent'
})
document.addEventListener('drop', (e) => {
    fileinput.files = e.dataTransfer.files
    inputbox.style.borderColor = 'transparent'
    fileProvided()
    e.preventDefault()
    return true
})

// File drag&drop
function fileProvided() {
    let file = fileinput.files[0]
    if (file) {
        downloadbutton.disabled = false
        fixerbuttons.querySelectorAll('button').forEach(ele => {
            ele.disabled = false
        })
        log_print(`File selected \`${file.name}\``)
    } else {
        downloadbutton.disabled = true
        fixerbuttons.querySelectorAll('button').forEach(ele => {
            ele.disabled = true
        })
        log_print(`File deselected`)
    }
}
fileinput.addEventListener('change', fileProvided)

// Load
function applyFixes() {
    let file = fileinput.files[0]
    if (mod == undefined) log_throw('[Fatal] Mod not defined')
    else if (mod.apply_fixes == undefined) log_throw('[Fatal] Functions not defined')
    else if (file) {
        file.arrayBuffer().then(buff => {
            // Apply fixes
            let fixesToApply = []
            let garbagesToRemove = []
            fixerbuttons.querySelectorAll('input:checked').forEach(element => {
                if (element.name && !fixesToApply.includes(element.name)) fixesToApply.push(element.name)
                if (element.name == "removegarbageblobs") garbagesToRemove.push(`[ ${element.getAttribute("val")} ]`)
            })
            if (!fixesToApply.length) {
                log_print('No fixes are selected')
                return
            }
            let newdata = mod.apply_fixes(new Uint8Array(buff), fixesToApply, garbagesToRemove)

            // Download file
            let blob = new Blob([newdata], {type: "application/octet-stream"})
            let a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            let url = window.URL.createObjectURL(blob)
            a.href = url
            let filename = file.name
            if (filename.endsWith('.sav')) {
                let insertionPoint = filename.lastIndexOf('.')
                filename = filename.slice(0, insertionPoint) + "_FIXED" + filename.slice(insertionPoint)
            }
            log_print(`Downloading file as \`${filename}\``)
            a.download = `${filename}`
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()
            log_print('Done!')
        })
        .catch(error => {
            log_throw(error)
        })
    }
}
downloadbutton.addEventListener('click', applyFixes)

// Extra checkbox logic
removegarbageblobs_checkall.addEventListener('input', () => {
    // Check all when the main checkbox is checked
    fixerbuttons.querySelectorAll('input[val]').forEach((element) => {
        element.checked = removegarbageblobs_checkall.checked
    })
})
fixerbuttons.querySelectorAll('input[val]').forEach((element) => {
    element.addEventListener('input', () => {
        // Check the main checkbox if everything has been checked
        if (fixerbuttons.querySelectorAll('input:checked[val]').length == fixerbuttons.querySelectorAll('input[val]').length) {
            removegarbageblobs_checkall.checked = true
        } else {
            removegarbageblobs_checkall.checked = false
        }
    })
})
