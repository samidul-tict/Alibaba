SELECT 
orr.RefunId, 
orr.RefundAutoId, 
orr.RefundStatus, 
orr.CreatedDate ,
orr.ModifieDate , 
orr.CustomerId, 
cm.Name as cname , 
orr.OrderId , 
om.OrderNo, 
orr.ProductId , 
pr.ProductCode, 
pr.Name, 
od.Quantity, 
od.TotalAmt 
FROM `orderrefundrequest` as orr 
JOIN `customermaster` as cm ON orr.CustomerId = cm.CustomerId 
JOIN `ordermaster` as om ON orr.OrderId = om.OrderId 
JOIN `productmaster` as pr ON orr.ProductId = pr.ProductId 
JOIN `orderdetail` as od ON orr.OrderDetailId = od.DOrderId 
ORDER BY RefunId DESC

var mySQLDate = jsonobj[0]["OrderedOn"];
          var datetime = new Date(Date.parse(mySQLDate.replace(/-/g, '/')));

connection.query('SELECT * FROM orderdetail WHERE OrderId = ?',[email[0].OrderId],(err,oddet)=>{
    if(err){
        response.json({'error':err})
    }else{
        for(var i of oddet[0]){
            connection.query('SELECT * FROM productmaster WHERE ProductId = ?',[i.ProductId],(err,prod)=>{
                    if(err){
                        response.json({'error':err})
                    }else{
                        var mySQLDate = email[0]["OrderedOn"];
                        var datetime = new Date(Date.parse(mySQLDate.replace(/-/g, '/')));
                        var retdate = datetime.setDate(datetime.getDate()+ prod[0].ReturnPolicyDays);
                        connection.query("UPDATE `orderdetail` SET RefundDateLimit = ? WHERE DOrderId = ?",[ retdate, i.DOrderId ],(err,docs)=>{
                            if(err){ res.send({'status':'400','error':err}) }
                        })
                    }
            }) 
        }
        
    }
})