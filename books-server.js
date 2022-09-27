const http = require("http");
const fs = require("fs");
const path = require("path");

const bookPath = path.join(__dirname, "db", "books.json");

const PORT = 4000
const HOST_NAME = "localhost"

function requestHandler(req, res) {
    if (req.url === "/books" && req.method === "GET"){
        //Load and return books
        getAllBooks(req, res)    
    }else if (req.url === "/books" && req.method === "POST"){
        //Create a new book
        addBook(req, res)
    }else if (req.url === "/books" && req.method === "PUT"){
        //Update a book
        updateBook(req, res)
    }else if (req.url === "/books" && req.method === "DELETE"){
        //Delete a book
        deleteBook(req, res)
    }
}


function getAllBooks(req, res) {
    fs.readFile(bookPath, "utf8", (err, data) => {
        if (err){
            console.log(err)
            res.writeHead(404)
            res.end("An error occured")
        }

        res.end(data)
    })
}

function addBook(req, res) {
    const body = []

    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parseBook = Buffer.concat(body).toString()
        const newBook = JSON.parse(parseBook)

        //Add new book to the existing array
        fs.readFile(bookPath, "utf8", (err, data) => {
            if (err) {
                console.log(err)
                res.writeHead(404)
                res.end("An error occured")
            }

            const oldBooks = JSON.parse(data)
            const allBooks = [...oldBooks, newBook]

            fs.writeFile(bookPath, JSON.stringify(allBooks, (err) =>{
                if (err) {
                    console.log(err)
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        message: "Internal Server Error. Could not save book to database"
                    }))
                }

                res.end(JSON.stringify(newBook))
            }))
        })
    })
}



function updateBook (req, res){
    const body = []

    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parseBook = Buffer.concat(body).toString()
        const detailsToUpdate = JSON.parse(parseBook)
        const bookId = detailsToUpdate.id

        fs.readFile(bookPath, "utf8", (err, books) => {
            if (err) {
                console.log(err)
                res.writeHead(404)
                res.end("An error occured")
            }

            // find the book in database
            const booksObj = JSON.parse(books)

            const bookIndex = booksObj.findIndex(book => book.id === bookId)
            if (bookIndex === -1){
                res.writeHead(404)
                res.end("Book id not found")
                return
            }

            const updatedBooks = {...booksObj[bookIndex], ...detailsToUpdate}
            booksObj[bookIndex] =updatedBooks

            fs.writeFile(bookPath, JSON.stringify(booksObj), (err) => {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end(JSON.stringify({
                        message: 'Internal Server Error. Could not save book to database.'
                    }));
                }

                res.writeHead(200)
                res.end("Update successfull!");
            });
   
        })
    })
}


function deleteBook(req, res) {
    const body = []

    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parsedBook = Buffer.concat(body).toString()
        const detailsToUpdate = JSON.parse(parsedBook)
        const bookId = detailsToUpdate.id

        fs.readFile(bookPath, "utf8", (err, books) => {
            if (err) {
                console.log(err)
                res.writeHead(400)
                res.end("An error occured")
            }

            const booksObj = JSON.parse(books)

            const bookIndex = booksObj.findIndex(book => book.id === bookId)

            if (bookIndex === -1) {
                res.writeHead(404)
                res.end("Book with the specified id not found!")
                return
            }

            // DELETE FUNCTION
            booksObj.splice(bookIndex, 1)

            fs.writeFile(bookPath, JSON.stringify(booksObj), (err) => {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end(JSON.stringify({
                        message: 'Internal Server Error. Could not save book to database.'
                    }));
                }

                res.writeHead(200)
                res.end("Deletion successfull!");
            });

        })

    })
}




const server = http.createServer(requestHandler)

server.listen(PORT, HOST_NAME, () => {
    booksDB = JSON.parse(fs.readFileSync(bookPath, "utf8"));
    console.log(`Server is listening at ${HOST_NAME}:${PORT}`)
})