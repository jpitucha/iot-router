const http = require('http')
const host = '192.168.0.102'
const port = 8080

const controllers = [
    { ip: '192.168.0.51', location: 'bedroom', devices: ['computer_ledstrip', 'ambient_ledstrip'] },
]

function findController(location, device) {
    var ip = ''
    controllers.forEach((controller) => {
        if (controller.location == location && controller.devices.includes(device)) {
            console.log(`Accessed ${device} in ${location} at ${controller.ip}`)
            ip = controller.ip
        }
    })
    return ip
}

const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')

    const contents = req.url.split('/')
    if (contents.length == 4) {
        location = contents[1]
        device = contents[2]
        command = contents[3]
        if (findController(location, device) !== '') {
            res.write('OK\n')
        } else {
            res.write('Controller Not Found\n')
        }
    } else {
        res.write('URL Error\n')
    }
    res.end()
})

server.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}/`)
})
