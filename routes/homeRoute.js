import  homecontroller from './../Controllers/HomeController.js';
import  express from 'express'
const router=express.Router();
router.post("/Addnewsletter",homecontroller.newAdresse );
router.post("/AddComment", homecontroller.newComment);

export default  router;

