const express = require('express');
const db = require('./db');
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

// root route-confirms the server is running

app.get('/', (req,res)=>{
    res.send('backend is running with MySQL');
});

// GET /students-returns all students from mysql

app.get('/students',(req,res)=>{
    const sql = 'SELECT * FROM students';
    db.query(sql, (error,results)=>{
        if(error){
            console.error('error getting students:',error);
            return res.status(500).json({error: 'failed to get students'});
        }
        res.json(results);
    });
});

// POST /students - receives new student data and inserts into MySQL

app.post('/students', (req, res) => {
    const { first_name, last_name, grade_level } = req.body;
    if (!first_name || !last_name || !grade_level) {
        return res.status(400).json({error: 'first_name, last_name, grade_level are required'});
    }
    const sql = 'INSERT INTO students (first_name, last_name, grade_level) VALUES (?,?,?)'; 
    db.query(sql, [first_name, last_name, grade_level], (error, results)=>{
        if(error){
            console.error('error adding students:', error);
        return res.status(500).json({error:'failed to add students'});
    }
    res.status(201).json({
        message: 'student added successfully',
        studentId: results.insertId
    });
    });
});

// GET /classes - returns all classes from mysql

app.get('/classes',(req,res)=>{
    const sql = 'SELECT * FROM classes';
    db.query(sql, (error,results)=>{
        if(error){
            console.error('error getting classes:',error);
            return res.status(500).json({error: 'failed to get classes'});
        }
        res.json(results);
    });
});

// GET /enrollments-returns joined data(student_name+class_name)

app.get('/enrollments',(req,res)=>{
    const sql = 'SELECT students.first_name, students.last_name, classes.class_name, classes.teacher_name FROM enrollments JOIN students ON enrollments.student_id = students.id JOIN classes ON enrollments.class_id = classes.id';
    db.query(sql, (error, results)=>{
        if(error){
            console.error('error getting enrollments:', error);
            return res.status(500).json({error: 'failed to get enrollments'});
        }
        res.json(results);
    });
});

// GET /users-returns all users (password excluded)

app.get('/users',(req,res)=>{
    const sql = 'SELECT id, first_name, last_name, email FROM users';
    db.query(sql, (error, results)=>{
        if(error) return res.status(500).json({error: 'failed to get users'});
        res.json(results);
    });
});

// POST /login-checks email and password against the users table

app.post('/login',(req,res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({error: 'email and password are required'});
    }
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (error, results)=>{
        if(error){
            console.error('login query error:', error);
            return res.status(500).json({error: 'something went wrong'});
            }
            if(results.length === 0){
                return res.status(401).json({error: 'invalid email or password'});
            }
            const user = results[0];
            if(user.password !== password){
                return res.status(401).json({error: 'wrong password'});
            }

        // login successful - returns name so frontend can update the navbar

        res.status(200).json({
            message: 'login successful',
            first_name: user.first_name,
            last_name: user.last_name,
            student_id: user.student_id
        });
    });
});

// POST /users-creates a new user account

app.post('/users',(req,res)=>{
    const {first_name, last_name, email, password}=req.body;
    if(!first_name || !last_name || !email || !password){
        return res.status(400).json({error: 'first_name, last_name, email, and password are required'});
    }
    if(password.length < 8){
        return res.status(400).json({error: 'password must be at least 8 characters long'});
    }
    const specialChar = /[!@#$%]/;
    if(!specialChar.test(password)){
        return res.status(400).json({error: 'password must include at least one special character: ! @ # $ %'});
    }
    const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?,?,?,?)';
    db.query(sql, [first_name, last_name, email, password], (error, results)=>{
        if(error){
            console.error('error creating users:', error);
            return res.status(500).json({error: 'failed to create user'});
        }
        res.status(201).json ({
            message: 'user created successfully', 
            userId: results.insertId
        });
    });
});

app.listen(PORT, ()=>{
    console.log(`server running at http://localhost:${PORT}`);
});

