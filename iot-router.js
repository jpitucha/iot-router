const http = require('http')
const fs = require('fs');
const net = require('net')
const host = '192.168.0.102'
const port = 8080

const controllers = [
    { ip: '192.168.0.110', location: 'bedroom', devices: ['computer_ledstrip', 'ambient_ledstrip'] },
]

function nicelyFormatedDate() {
    let now = new Date();
    return `${now.getDate()}.${now.getMonth()}.${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
}

function findController(location, device) {
    var ip = ''
    controllers.forEach((controller) => {
        if (controller.location == location && controller.devices.includes(device)) {
            let msg = `${nicelyFormatedDate()} | Accessed ${device} in ${location} at ${controller.ip}`
            fs.appendFile('iot_router_log.txt', msg + '\n', (err) => {
                if (err) throw err;
            })
            console.log(msg)
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
        let ip = findController(location, device)
        if (ip !== '') {
            let client = net.Socket()
            client.connect(23, ip, () => {
                client.write('/' + device + '/' + command)
                client.end()
            })
            res.write('OK\n')
        } else {
            let msg = 'Controller Not Found!\n'
            fs.appendFile('iot_router_log.txt', nicelyFormatedDate() + ' | ' + msg, (err) => {
                if (err) throw err;
            })
            res.write(msg)
        }
    } else {
        let msg = 'URL Error\n'
        fs.appendFile('iot_router_log.txt', nicelyFormatedDate() + ' | ' + msg, (err) => {
            if (err) throw err;
        })
        res.write(msg)
    }
    res.end()
})

server.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}/`)
})
