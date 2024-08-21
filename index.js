import express from "express"
import bodyParser from "body-parser"
import methodOverride from "method-override"
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

// ! ใช้ไม่ได้ app.use(methodOverride('_method'));

// * Allow method override, supporting the header and body at the same time
app.use(methodOverride('X-HTTP-METHOD-OVERRIDE')) // look at the header
app.use(methodOverride(function(req, res){ // ALSO look in the body
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))


let blogs = []

app.get("/", (req, res) => {
    if (blogs.length != 0){
        res.render("home.ejs", {blogs: blogs})
    }
    else {
        res.render("home.ejs")
    }
})

app.get("/blogForm", (req, res) => {
    res.render("blogForm.ejs")
})

app.get("/edit", (req, res) => {
    console.log(`Received a ${req.method} request with id: ${req.query.id}`);
    res.render("edit.ejs",{id: req.query.id});
});


app.post("/submit", (req, res) => {
    let blog = {
        id: blogs.length + 1,
        title: req.body.blogTitle,
        details: req.body.details
    }
    blogs.push(blog);
    console.table(blogs)
    res.render("home.ejs", {blogs: blogs})
})

app.patch("/submitEdit", (req, res) => {
    console.log(`Received a ${req.method} request with id: ${req.body.id}`);
    const blogId = req.body.id;
    const updatedBlog = {
        id: parseInt(blogId),
        title: req.body.blogTitle,
        details: req.body.details
    };
    blogs[blogId - 1] = updatedBlog
    console.table(blogs)
    res.render("home.ejs", {blogs: blogs});
});

app.delete("/delete", (req, res) => {
    console.log(`Received a ${req.method} request with id: ${req.body.id}`);
    blogs = blogs.filter(blog => blog.id != (req.body.id));
    console.table(blogs)
    res.render("home.ejs", {blogs: blogs});
})

app.listen(port, () => {
    console.log(`Blog app listening at http://localhost:${port}`)
})