import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import methodOverride from "method-override";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import ShortUniqueId from "short-unique-id";

const app = express();
const port = process.env.PORT || 3000;
const uid = new ShortUniqueId();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.engine("ejs", ejs.__express); // Add this line to set the templating engine
app.set("views", path.join(__dirname, "./views")); // Assuming 'views' is in same level as root folder

// ! ใช้ app.use(methodOverride('_method')); ไม่ได้

// * Allow method override, supporting the header and body at the same time
app.use(methodOverride("X-HTTP-METHOD-OVERRIDE")); // look at the header
app.use(
	methodOverride(function (req, res) {
		// ALSO look in the body
		if (req.body && typeof req.body === "object" && "_method" in req.body) {
			// look in urlencoded POST bodies and delete it
			var method = req.body._method;
			delete req.body._method;
			return method;
		}
	})
);

let blogs = [];

app.get("/", (req, res) => {
	if (blogs.length != 0) {
		res.render("home.ejs", { blogs: blogs });
	} else {
		res.render("home.ejs");
	}
});

app.get("/blogForm", (req, res) => {
	res.render("blogForm.ejs");
});

app.get("/edit", (req, res) => {
	console.log(`Received a ${req.method} request with id: ${req.query.id}`);
	res.render("edit.ejs", { id: req.query.id, dateTime: req.query.dateTime });
});

app.post("/submit", (req, res) => {
	let date = new Date();
	let s = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
	let m = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
	let h = (date.getHours() < 10 ? "0" : "") + date.getHours();
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	let blogDateTime = `${year}-${month}-${day} ${h}:${m}:${s}`;

	let blog = {
		id: uid.rnd(),
		title: req.body.blogTitle,
		details: req.body.blogDetails,
		dateTime: blogDateTime,
	};
	blogs.push(blog);
	console.table(blogs);
	res.render("home.ejs", { blogs: blogs });
});

app.patch("/submitEdit", (req, res) => {
	console.log(`Received a ${req.method} request with id: ${req.body.id}`);
	const blogId = req.body.id;
	const blogDateTime = req.body.blogDateTime;
	const updatedBlog = {
		id: parseInt(blogId),
		title: req.body.blogTitle,
		details: req.body.blogDetails,
		dateTime: blogDateTime,
	};
	blogs[blogId - 1] = updatedBlog;
	console.table(blogs);
	res.render("home.ejs", { blogs: blogs });
});

app.delete("/delete", (req, res) => {
	console.log(`Received a ${req.method} request with id: ${req.body.id}`);
	blogs = blogs.filter((blog) => blog.id != req.body.id);
	console.table(blogs);
	res.render("home.ejs", { blogs: blogs });
});

app.listen(port, () => {
	console.log(`Blog app listening at http://localhost:${port}`);
});
