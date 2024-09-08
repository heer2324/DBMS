var express=require('express');
const app=express();
const mysql=require('mysql2');
const bodyParser=require('body-parser');
app.use(bodyParser.json());
const path = require('path');



const db=mysql.createConnection({
    localhost:'localhost',
    user:'root',
    password:'prince123',
    database:'dbms_project'
})
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

app.set('view engine', 'ejs');

app.use(express.static("htmlfiles"));
app.use(express.static(path.join(__dirname, 'htmlfiles')));
app.use(bodyParser.urlencoded({extended:false}));

app.get('/',(req,res)=>{
    res.sendFile('htmlfiles/home.html',{root:__dirname});
})


app.get('/delorder',(req,res)=>{
    res.sendFile('htmlfiles/orderId2.html',{root:__dirname})
})

app.post('/delorder',async(req,res)=>{
    try{

    
    var orderId=req.body.orderId;
    var cusid;
    var productId;
    var totalquantity;
    var inventory_quantity;

    var q1=`select customer_id from ORDERS where order_id="${orderId}"`
    await new Promise((resolve, reject) => {
        db.query(q1, (err, result) => {
            if (err) reject(err);
            cusid=result[0].customer_id;
            resolve();
        });
    });

    var q1=`select product_id from orders where order_id="${orderId}"`
    await new Promise((resolve, reject) => {
        db.query(q1, (err, result) => {
            if (err) reject(err);
           productId= result[0].product_id;
            resolve();
        });
    });
    
    var q1=`select quantity from orders where order_id="${orderId}"`
    await new Promise((resolve, reject) => {
        db.query(q1, (err, result) => {
            if (err) reject(err);
            totalquantity=result[0].quantity;
            resolve();
        });
    });
    var q2=`delete from orders where order_id="${orderId}"`
    await new Promise((resolve, reject) => {
        db.query(q2, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });

    var q1=`select inventory_quantity from product where product_id="${productId}"`
    await new Promise((resolve, reject) => {
        db.query(q1, (err, result) => {
            if (err) reject(err);
            inventory_quantity=result[0].inventory_quantity
            resolve();
        });
    });

    

    var q6=`update product set  inventory_quantity=(${totalquantity}+${inventory_quantity}) where product_id="${productId}"`
    await new Promise((resolve, reject) => {
        db.query(q6, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });

    var q2=`delete from customer where customer_id="${cusid}"`
    var q3=`delete from orders where order_id="${orderId}"`
    await new Promise((resolve, reject) => {
        db.query(q2, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    await new Promise((resolve, reject) => {
        db.query(q3, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });

    res.send("Deleted");

 }catch(err){
    console.log(err);
    res.status(500).send("Internal Server Error");
 }
    
})

app.get('/myorders',(req,res)=>{
    res.sendFile('htmlfiles/orderId.html',{root:__dirname})
})

app.post('/myorders',async(req,res)=>{
    
    try{
        var orderId=req.body.orderId;
        var cusid;
        var productId;
        var cusname;
        var quantity;
        var price;
        var productName;
        var q1=`select customer_id from orders where order_id="${orderId}"`
        await new Promise((resolve, reject) => {
            db.query(q1, (err, result) => {
                if (err) reject(err);
               cusid= result[0].customer_id;
                resolve();
            });
        });

        var q1=`select product_id from orders where order_id="${orderId}"`
        await new Promise((resolve, reject) => {
            db.query(q1, (err, result) => {
                if (err) reject(err);
               productId= result[0].product_id;
                resolve();
            });
        });
        var q1=`select name from customer where customer_id=${cusid}`
        await new Promise((resolve, reject) => {
            db.query(q1, (err, result) => {
                if (err) reject(err);
                cusname=result[0].name;
                resolve();
            });
        });
        var q1=`select product_name from product where product_id="${productId}"`
        await new Promise((resolve, reject) => {
            db.query(q1, (err, result) => {
                if (err) reject(err);
               productName= result[0].product_name;
                resolve();
            });
        });

        var q1=`select price from product where product_id="${productId}"`;
        
        await new Promise((resolve, reject) => {
            db.query(q1, (err, result) => {
                if (err) reject(err);
               price= result[0].price;
                resolve();
            });
        });

        var q1=`select quantity from orders where order_id="${orderId}"`;
        
        await new Promise((resolve, reject) => {
            db.query(q1, (err, result) => {
                if (err) reject(err);
               quantity= result[0].quantity;
                resolve();
            });
        });
        res.render('myorders',{order: { 
            orderId: orderId,
            cusname: cusname,
            cusid: cusid,
            productId: productId,
            productName: productName,
            quantity: quantity,
            totalprice: price
    }});
        // res.json({orderId: orderId,name:cusname,customer_id:cusid,productId:productId,productName:productName,quantity:quantity,totalprice:calculateTotalPrice(price,quantity)});
    }catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
    

})



app.get('/product',(req,res)=>{
    res.sendFile('htmlfiles/product.html',{root:__dirname});
})

app.get('/product/:product_id',(req,res)=>{
    res.render("cusform",{product_id:req.params.product_id});
})

function calculateTotalPrice(price, quantity) {
    return price * quantity;
}

app.post('/product/:product_id',async(req,res)=>{
    try{

    const product_id=req.params.product_id;
    const name=req.body.name;
    const phoneNo=req.body.phoneNo;
    const address=req.body.address;
    const inventory_quantity=req.body.inventory_quantity;

    var q1=`insert into customer (name,phoneNO,address) values ("${name}","${phoneNo}","${address}")`;
    var q2=`select customer_id from customer order by customer_id desc limit 1`
   
    
    await new Promise((resolve, reject) => {
        db.query(q1, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    const rows = await new Promise((resolve, reject) => {
        db.query(q2, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
    const cusid = rows[0].customer_id;
    var price;
    console.log(product_id);
    var q4=`select price from product where product_id="${product_id}"`;
    
    await new Promise((resolve, reject) => {
        db.query(q4, (err, result) => {
            if (err) reject(err);
            price=result[0].price;
            resolve();
            
        });
    });
   

    var q3=`insert into orders (quantity,customer_id,product_id) values (${inventory_quantity},${cusid},"${product_id}")`;
    console.log(cusid);
    await new Promise((resolve, reject) => {
        db.query(q3, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    var totalquantity;
    var q5=`select inventory_quantity from product where product_id="${product_id}"`
    await new Promise((resolve, reject) => {
        db.query(q5, (err, result) => {
            if (err) reject(err);
            totalquantity=result[0].inventory_quantity;
            resolve();
        });
    });

    var q6=`update product set  inventory_quantity=(${totalquantity}-${inventory_quantity}) where product_id="${product_id}"`
    await new Promise((resolve, reject) => {
        db.query(q6, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    res.json({name:name,phonenumber: phoneNo,address:address ,orderId: cusid, totalprice: calculateTotalPrice(price, inventory_quantity) });
    // res.render("cusform",{product_id:product_id});

}catch(err){
    console.log(err);
    res.status(500).send("Internal Server Error");
}


})

// app.get('/customers',(req,res)=>{
//     const q="select * from customer"
//     db.query(q,(err,result,feild)=>{
//         if(err){
//             console.log(err);
//             return res.status(500).send("Error fetching");
//         }
//         res.render(__dirname + "/customers",{customer:result});

//     })
   
// })
app.get('/customers',function(req,res){
        var sql = "select * from customer";
        db.query(sql, function (err, result) {
            if (err) throw err;
            res.render("customer",{customer:result});
        });
});

app.get('/products',(req,res)=>{
    var q="select * from product";
    db.query(q,(err,result)=>{
        if(err) throw err;
        res.render("products",{product:result});
    })
})

app.get('/orders',(req,res)=>{ 
    var q="select * from orders";
    db.query(q,(err,result)=>{
        if(err) throw err;
        res.render("orders",{orders:result});
    })
})

app.get('/aboutus',(req,res)=>{
    res.sendFile('htmlfiles/about.html',{root:__dirname});
})


app.listen(3000,()=>{
    console.log("server is live");
})