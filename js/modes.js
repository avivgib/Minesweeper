function changeMode(selectedMode) {
    const elLightMode = document.querySelector('.light')
    const elDarkMode = document.querySelector('.dark')

    if (selectedMode.classList.contains('light')) {
        elLightMode.checked = true
        elDarkMode.checked = false
        document.body.classList.remove('dark-mode')
    } else {
        elDarkMode.checked = true
        elLightMode.checked = false
        document.body.classList.add('dark-mode')
    }
}