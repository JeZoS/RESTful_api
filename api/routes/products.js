const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const multer = require('multer');
const Auth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename:function(req,file,cb){
        cb(null,new Date().toISOString()+file.originalname);
    }
});
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

const upload = multer({storage:storage,limits:{fileSize:1024 * 1024 * 5},fileFilter:fileFilter});

router.get('/',(req,res,next)=>{
    Product.find().select("name price _id productImage").exec().then(doc=>{
        const response = {
            count:doc.length,
            products:doc.map(doc=>{
                return{
                    name:doc.name,
                    price:doc.price,
                    _id:doc._id,
                    productImage:doc.productImage,
                    request:{
                        type:'GET',
                        url:'http://localhost:8000/products/' + doc._id
                    }
                }
            })
        }
        // if(doc.length>=0){
        res.status(200).json(response);
        
/*      }  else{
            res.status(404).json({
                message:'No entries'
            })
        }
    */  }).catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    })
})

router.post('/',Auth,upload.single('productImage'),(req,res,next)=>{
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        productImage:req.file.path
    });
    product.save().then(result=>{
        console.log(result); 
        res.status(200).json({
            message:'Created product',
            product : {
                name:result.name,
                price:result.price,
                _id:result.id,
                request:{
                    type:'GET',
                    url:'http://localhost:8000/products/'+result._id
                }
            }
        })
    }).catch(err=>{
        console.log(err);
        res.status(500).json({error:err})
    });
})

router.get('/:id',(req,res,next)=>{
    const id = req.params.id
    Product.findById(id)>select("name price _id productImage").exec().then(doc=>{
        console.log(doc);
            if(doc){ 
                res.status(200).json(doc);
            }else{
                res.status(404).json({message:'not found'})
            }
    }).catch(err=> {
        console.log(err);
        res.status(500).json({
            error:err
        })
        })
    });

router.patch('/:id',Auth,(req,res,next)=>{
    const id = req.params.id
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName]=ops.value;
    }
    Product.update({_id:id},{$set: updateOps}).exec().then(result=>{
        console.log(result);
        res.status(200).json({
            message:'Product updated',
            request:{
                type:'GET',
                url:"http://localhost:8000/products/"+id
            }
        });
    }).catch(err=>{
        console.log(err);
        res.status(500).json({error:err})
    });
});

router.delete('/:id',Auth,(req,res,next)=>{
    const id = req.params.id
    Product.remove({_id:id}).exec().then(result=>{
        res.status(200).json({
            message:'Product deleted'
        });
    }).catch(
        err=>{
         console.log(err);   
        res.status(500).json({error:err});
    })
})

module.exports = router;