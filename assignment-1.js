// import modules
const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

// Define in-memory users array
let users = [
    { id: 1, name: 'Nagendra', email: 'nagendra@yopmail.com' },
    { id: 2, name: 'Babu', email: 'babu@yopmail.com' }
];

// Request body parser (for JSON payload)
const parseRequestBody = (req, res, callback) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            req.body = JSON.parse(body);
            callback();
        } catch (error) {
            res.statusCode = 400;
            res.end('Invalid JSON');
        }
    });
};

// Create an HTTP server
const server = http.createServer((req, res) => {

    // Log the request using middleware
    const currentTime = new Date().toISOString();
    console.log(`${currentTime} - ${req.method} ${req.url}`);

    // Parse the URL and determine the route
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handling GET, POST, PUT, DELETE requests
    // /api/users: Handle CRUD operations (Create, Read, Update, Delete) for a simulated user database.

    // GET Request
    if (pathname === '/api/users' && method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(users));
    }
    // POST Request
    else if (pathname === '/api/users' && method === 'POST') {
        parseRequestBody(req, res, () => {
            const { name, email } = req.body;
            const newUser = {
                id: users.length + 1,
                name,
                email
            };
            users.push(newUser);
            res.statusCode = 201; // Created
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(newUser));
        });
    }

    // PUT request
    else if (pathname.startsWith('/api/users/') && method === 'PUT') {
        const userId = parseInt(pathname.split('/')[3]);
        parseRequestBody(req, res, () => {
            const { name, email } = req.body;
            const user = users.find(u => u.id === userId);
            if (user) {
                user.name = name || user.name;
                user.email = email || user.email;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(user));
            } else {
                res.statusCode = 404; // Not Found
                res.end('User not found');
            }
        });
    }

    // DELETE request
    else if (pathname.startsWith('/api/users/') && method === 'DELETE') {
        const userId = parseInt(pathname.split('/')[3]);
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            const deletedUser = users.splice(index, 1);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(deletedUser[0]));
        } else {
            res.statusCode = 404; // Not Found
            res.end('User not found');
        }
    }

    // /files/:filename (Serve static files from a public directory)
    else if (pathname.startsWith('/files/')) {
        const filename = pathname.split('/')[2];
        const filePath = path.join(__dirname, 'public', filename);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 404; // Not Found
                res.end('File not found');
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
            }
        });
    }

    // Error 404
    else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});


// server - 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handling Server Error 
server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1); // Gracefully exit on error
});
