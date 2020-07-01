const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const product = require('../models/product');
const Auth = require('../middleware/check-auth');
 
router.get('/',Auth,(req,res,next)=>{
    Order.find().select("quantity _id product").populate('product').exec().then(doc=>{
        res.status(200).json({
            count:doc.length,
            orders:doc.map(doc=>{
                return{
                    _id:doc._id,
                    product: doc.product,
                    quantity:doc.quantity,
                    request:{
                        type:"GET",
                        url:"http://localhost:8000/orders/"+doc._id
                    }
                }
            })
        }); 
    }).catch(err=>{
        console.log(err);
        res.status(500).json(err);
    });
});
 
router.post('/',Auth,(req,res,next)=>{
    Product.findById(req.body.productId).then(product=>{
        if(!product){
            return res.status(404).json({message:"product not found"})
        }
        const order = new Order({
            _id:mongoose.Types.ObjectId(),
            quantity:req.body.quantity,
            product:req.body.productId
        });
        order.save().then(result=>{
            console.log(result);
            res.status(201).json({
                message:"Order stored",
                createdOrder:{
                    _id:result._id,
                    product:result.product,
                    quantity:result.quantity
                },
                request:{
                    type:"GET",
                    url:"http://localhost:8000/orders/"+result.id
                }
            })
    }).catch(err=>{
        console.log(err);
        res.status(500).json({error:err})
    });
    }).catch(err=>{
        res.status(404).json({
            message:'Product not found',
            error:err
        })
    })
});

router.get('/:id',Auth,(req,res,next)=>{
    Order.findById(req.params.id).select().exec().then(order=>{
        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }
        res.status(200).json({
            order:{
                _id:order._id,
                product:order.product,
                quantity:order.quantity
            },
            request:{
                type:"GET",
                url:"http://localhost:8000/orders"
            }
        })
    }).catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

router.delete('/:id',Auth,(req,res,next)=>{
    Order.remove({_id:req.params.id}).exec().then(result=>{
        res.status(200).json({
            message:"Order deleted",
            request:{
                type:"POST",
                url:"http://localhost:8000/orders"
            }
        })
    }).catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

module.exports = router;