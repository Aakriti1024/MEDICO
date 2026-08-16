var express = require("express");
var app = express();
require("dotenv").config();
app.listen(2006, function () {
    console.log("server1 started");
})
app.use(express.urlencoded(true));

// sql-----------------
var mysql = require("mysql2");
let url = process.env.AIVEN_URL;
let myysqlcon = mysql.createConnection(url);
myysqlcon.connect(function (err) {
    if (err == null) {
        console.log("successfullllyyyy connecteddd");
    }
    else {
        console.log("failed");

    }
})


app.get("/", function (req, resp) {
    var path = __dirname + "/public/startingpage.html";
    resp.sendFile(path);
})

//------------cloudinary

var fileuploader = require("express-fileupload");
app.use(fileuploader());

var cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_API_SECRET// Click 'View API Keys' above to copy your API secret
});
//console.log("NAME =", process.env.CLOUD_NAME);
//console.log("KEY =", process.env.CLOUD_KEY);
//console.log("SECRET =", process.env.CLOUD_API_SECRET);
app.use(express.static("public"));

//----------------ajax-------------

app.get("/signup-route", function (req, resp) {
    let email = req.query.emailkuch;
    let pwd = req.query.pwdkuch;
    let utype = req.query.userkuch;
    myysqlcon.query("INSERT INTO userspro VALUES (?,?,?,CURRENT_DATE(),1)", [email, pwd, utype], function (err, result) {
        if (err == null) {
            resp.send("Signed up successfully");
        }
        else {
            resp.send(err.message);
        }
    })
})
//------------------------LOGIN AJAX------------

app.get("/login-route", function (req, resp) {
    let emaill = req.query.emailLogin;
    let pwd = req.query.pwdLogin;

    myysqlcon.query(" select utype,current_status from userspro where email_id=? and pass=?",
        [emaill, pwd], function (err, result) {
            if (err == null) {
                if(result.length==0)
                    resp.send("No user found,Please continue to signup");
                if (result.length == 1 && result[0].current_status == 1) {
                    resp.send(result[0].utype);
                }
                else if (result.length == 1 && result[0].current_status == 0) {
                    resp.send("You are blocked by admin.");
                } 
                else {
                    resp.send("invalid credentials");
                } 
            } 
            else {
                resp.send(err.message);
            }
        })
})
 
//signup email check 
app.get("/email-check", function (req, resp) {
    let email1 = req.query.emailcheck;
    myysqlcon.query("select * from userspro where email_id=?", [email1], function (err, result) {
        if (err == null) {
            if (result.length == 1) {
                resp.send("Already occupied")

            }

        }
        else {
            resp.send(err.message);
        }
    })
})

//======================donor page======================
app.get("/donor-prof", function (req, resp) {
    var path = __dirname + "/public/donor-profile.html";
    resp.sendFile(path);
})



app.get("/avail-med", function (req, resp) {
    var path = __dirname + "/public/availmed.html";
    resp.sendFile(path);
})

//=====================avail med page form 
app.post("/availmedform", async function (req, resp) {

    let msg = "file not uploaed";
    let myyurl = "nopic.jpg";
    if (req.files != null) {

        let fileName = req.files.medimgg.name;
        let fullPath = __dirname + "/uploads/" + fileName;  //
        await req.files.medimgg.mv(fullPath);
        //   resp.send(fileName);
        msg = "file uploaded";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myyurl = picUrlResult.url;
            console.log("");
            console.log(myyurl);
        });
    }

    let email = req.body.txtEmailn;
    let medicine = req.body.txtMedn;
    let expd = req.body.txtExpn;
    let comp = req.body.txtCompanyn;
    let pack = req.body.packingn;
    let qty = req.body.txtQtyn;
    let inf = req.body.txtInfon;
    myysqlcon.query("insert into medicines26 (emailid,medname,expdate,company,packing,qty,info,picurl) values (?,?,?,?,?,?,?,?) ", [email, medicine, expd, comp, pack, qty, inf, myyurl], function (err) {
        if (err) {
            console.log(err);
            console.log("Message:", err.message);
            console.log("SQL Message:", err.sqlMessage);

            resp.send(err.sqlMessage);
            return;
        }

        resp.send("Record Saved");
    });

})

//==================donor prof save data==============

app.post("/donorprof", async function (req, resp) {
    //adhar--- myyurlADHAR
    let msgADHAR = "file not uploaed";
    let myyurlADHAR = "nopic.jpg";
    if (req.files != null) {

        let fileNameA = req.files.adharpic.name;
        let fullPathA = __dirname + "/uploads/" + fileNameA;  //
        await req.files.adharpic.mv(fullPathA);
        //   resp.send(fileName);
        msgADHAR = "file uploaded";

        await cloudinary.uploader.upload(fullPathA).then(function (picUrlResult) {
            myyurlADHAR = picUrlResult.url;
            console.log("");
            console.log(myyurlADHAR);
        });
    }
    //profile pic- myyurl  
    let msg = "file not uploaed";
    let myyurl = "nopic.jpg";
    if (req.files != null) {

        let fileName = req.files.profilePicc.name;
        let fullPath = __dirname + "/uploads/" + fileName;  //
        await req.files.profilePicc.mv(fullPath);
        //   resp.send(fileName);
        msg = "file uploaded";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myyurl = picUrlResult.url;
            console.log("");
            console.log(myyurl);
        });
    }

    let e = req.body.txtEmailN;
    let n = req.body.txtNameN;
    let m = req.body.txtMobileN;
    let a = req.body.txtAddressN;
    let c = req.body.txtCityN;

    myysqlcon.query("insert into dprofiles  values (?,?,?,?,?,?,?) ", [e, n, m, a, c, myyurlADHAR, myyurl], function (err) {
        if (err) {
           
            resp.send(err.message);

        }

        resp.send("Record Saved");
    });
})

 
//==========================for updating in the donor profile============
//while updating all fields are kept same just for file type input it is imp to give new or prev one to store back
app.post("/updateprof", async function (req, resp) {
    //adhar--- myyurlADHAR
    let msgADHAR = "file not uploaed";
    let myyurlADHAR = req.body.hdn;
    if (req.files && req.files.adharpic) {

        let fileNameA = req.files.adharpic.name;
        let fullPathA = __dirname + "/uploads/" + fileNameA;  //
        await req.files.adharpic.mv(fullPathA);
        //   resp.send(fileName);
        msgADHAR = "file uploaded";

        await cloudinary.uploader.upload(fullPathA).then(function (picUrlResult) {
            myyurlADHAR = picUrlResult.url;
            console.log("");
            console.log(myyurlADHAR);
        });
    }

    //profile pic- myyurl
    let msg = "file not uploaed";
    let myyurl = req.body.hdn1;
    if (req.files && req.files.profilePicc) {

        let fileName = req.files.profilePicc.name;
        let fullPath = __dirname + "/uploads/" + fileName;  //
        await req.files.profilePicc.mv(fullPath);
        //   resp.send(fileName);
        msg = "file uploaded";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myyurl = picUrlResult.url;
            console.log("");
            console.log(myyurl);
        });
    }


    let e = req.body.txtEmailN;
    let n = req.body.txtNameN;
    let m = req.body.txtMobileN;
    let a = req.body.txtAddressN;
    let c = req.body.txtCityN;

    myysqlcon.query("update dprofiles set name=?,mobile=?,address=?,city=?,acardpath=?,picpath=? where email_id=?  ", [n, m, a, c, myyurlADHAR, myyurl, e], function (err) {
        if (err) {
            console.log(err);
            console.log("Message:", err.message);
            console.log("SQL Message:", err.sqlMessage);

            resp.send(err.sqlMessage);
            return;
        }

        resp.send("Updated successfully");
    });
})

//=============================AJAXXXX==================
app.get("/show-data-profile", function (req, resp) {
    let emailll = req.query.emailkuj;
    myysqlcon.query("select * from dprofiles where email_id=?", [emailll], function (err, result) {
        if (err == null) {
            resp.send(result);
        }
        else {
            resp.send(err.message);
        }
    })
})

//===================FOR AVAIL EQUIPMENT PAGE============
app.get("/availEquip", function (req, resp) {
    var path = __dirname + "/public/availEquip.html";
    resp.sendFile(path);
})



app.post("/availEquip", async function (req, resp) {

    let msg1 = "file not uploaed";
    let myyurl1 = "nopic.jpg";
    if (req.files != null) {

        let fileNameA = req.files.objpic.name;
        let fullPathA = __dirname + "/uploads/" + fileNameA;  //
        await req.files.objpic.mv(fullPathA);
        //   resp.send(fileName);
        msg1 = "file uploaded";

        await cloudinary.uploader.upload(fullPathA).then(function (picUrlResult) {
            myyurl1 = picUrlResult.url;
            console.log("");
            console.log(myyurl1);
        });
    }
    //profile pic- myyurl
    let msg = "file not uploaed";
    let myyurl = "nopic.jpg";
    if (req.files != null) {

        let fileName = req.files.profilePicc.name;
        let fullPath = __dirname + "/uploads/" + fileName;  //
        await req.files.profilePicc.mv(fullPath);
        //   resp.send(fileName);
        msg = "file uploaded";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myyurl = picUrlResult.url;
            console.log("");
            console.log(myyurl);
        });
    }

    let e = req.body.email;
    let equip = req.body.equipment;
    let cond = req.body.condition;
    let typ = req.body.listingType;
    let amt = req.body.amountname;
    let inf = req.body.otherinfo;
    myysqlcon.query("insert into equipments (emailid,equipment,conditions,type,amount,pic1url,pic2url,info) values (?,?,?,?,?,?,?,?) ", [e, equip, cond, typ, amt, myyurl1, myyurl, inf], function (err) {
        if (err) {
            resp.send(err.message);
        }

        resp.send("Record Saved");
    });
})
//-===========angular ANGULAR=========================


app.get("/fetch-all", function (req, resp) {
    var path = __dirname + "/public/admin-users-dash.html";
    resp.sendFile(path);
})


app.get("/fetch-all-records", function (req, resp) {
    myysqlcon.query("select * from userspro", function (err, result) {
        if (err == null) resp.send(result);
        else resp.send(err.message);
    })
})

//--dlt a record
app.get("/delete-particular-record", function (req, resp) {
    let e = req.query.ekujv;
    myysqlcon.query("delete from userspro where email_id=?", [e], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1) {
                resp.send("record deleted successfully");
            }

        }
        else {
            resp.send(err.message);
        }
    })
})

//------========block unblock========------
app.get("/blockunblock", function (req, resp) {
    let stat = req.query.s;
    let email = req.query.e;
    myysqlcon.query("update userspro set current_status = ? where email_id=?", [stat, email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1) {
                resp.send("altered");
            }
        }
        else {
            resp.send(err.message);
        }
    })
})

//========== admin-donors-page ============
app.get("/donors-fetchdata", function (req, resp) {
    var path = __dirname + "/public/admin-donors-dash.html";
    resp.sendFile(path);
})

app.get("/all-donors", function (req, resp) {
    myysqlcon.query("select * from dprofiles", function (err, result) {
        if (err == null) {
            resp.send(result);
        }

        else resp.send(err.message);
    })
})

//===========DONOR DASHBOARD========
app.get("/donor-dashboard", function (req, resp) {
    var path = __dirname + "/public/donor-dashboard.html";
    resp.sendFile(path);
})

//fetch medicines for the modal for medicine management
app.get("/fetch-medicines", function (req, resp) {
    let email = req.query.e;


    myysqlcon.query("select * from medicines26 where emailid=? ", [email], function (err, result) {
        if (err == null) {
            resp.send(result);
        }
        else resp.send(err.message);
    })
})

//medicine add +
app.get("/add-that-medicine", function (req, resp) {
    let c = req.query.qy;
    let no = req.query.ridno;
    myysqlcon.query("update medicines26 set qty=? where rid=?", [c, no], function (err, result) {
        if (err == null) {
            resp.send(result);

        }
        else resp.send(err.message);
    })
})


//medicine sub -
app.get("/sub-that-medicine", function (req, resp) {
    let c = req.query.qy;
    let no = req.query.ridno;
    myysqlcon.query("update medicines26 set qty=? where rid=?", [c, no], function (err, result) {
        if (err == null) {
            resp.send(result);

        }
        else resp.send(err.message);
    })
})


//medicine dlt 
app.get("/dlt-that-medicine", function (req, resp) {
    let c = req.query.riid;

    myysqlcon.query("delete from medicines26 where rid=?", [c], function (err, result) {
        if (err == null) {
            resp.send(result);

        }

        else resp.send(err.message);
    })
})

//==============equipments modal for management 
app.get("/fetch-equip", function (req, resp) {
    let email = req.query.e;


    myysqlcon.query("select * from equipments where emailid=? ", [email], function (err, result) {
        if (err == null) {
            resp.send(result);
        }
        else resp.send(err.message);
    })
})

//equip dlt 
app.get("/dlt-that-equip", function (req, resp) {
    let c = req.query.riid;

    myysqlcon.query("delete from equipments where rid=?", [c], function (err, result) {
        if (err == null) {
            resp.send(result);

        }

        else resp.send(err.message);
    })
})

//change password in settings 
app.get("/change-pass", function (req, resp) {
    let e = req.query.e;
    let op = req.query.opass;
    let np = req.query.npass;
    myysqlcon.query("update userspro set pass=? where email_id=? and pass=?", [np, e, op], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1) {
                resp.send("password changed");
            }
            else
                resp.send("Invalid Email ID or Old Password");
        }
        else {
            resp.send("invalid details");
        }
    })
})

//===============ADDMIIINN DASHHHBOAOAARRDDDDD
app.get("/admin-dashboard", function (req, resp) {
    var path = __dirname + "/public/admin-dashboard.html";
    resp.sendFile(path);
})

app.get("/medcards", function (req, resp) {
    var path = __dirname + "/public/medicineinfo.html";
    resp.sendFile(path);
})

app.get("/fetch-med-cards", function (req, resp) {
    myysqlcon.query("select * from medicines26 ", function (err, result) {
        if (err == null) {
            resp.send(result);
        }
        else {
            resp.send(err.message);
        }
    })
})
//eqp cards for admin 
 
app.get("/fetch-eqp-cards", function (req, resp) {
    myysqlcon.query("select * from equipments ", function (err, result) {
        if (err == null) {
            resp.send(result);
        }
        else {
            resp.send(err.message);
        }
    })
})
//donor details in medicineinfo 
app.get("/fetch-donor-details", function (req, resp) {
    let e = req.query.email;
    myysqlcon.query("select * from dprofiles where email_id=?", [e], function (err, result) {
        if (err == null) {
            resp.send(result)
        }
        else {
            resp.send(err.message);
        }
    })
})

//===========================NGGOOOO PAGEE==========================
app.get("/ngo-page-med", function (req, resp) {
    var path = __dirname + "/public/ngoFindMed.html";
    resp.sendFile(path);
})
app.get("/ngo-page-eqp", function (req, resp) {
    var path = __dirname + "/public/ngoFindEqp.html";
    resp.sendFile(path);
})
app.get("/ngo-page", function (req, resp) {
    var path = __dirname + "/public/ngo-dashboard.html";
    resp.sendFile(path);
})
//seelcting cities
app.get("/fetch-distinct-cities", function (req, resp) {
    myysqlcon.query("select distinct city from dprofiles", function (err, result) {
        if (err == null) {
            resp.send(result);
        }
        else resp.send(err.message);
    })
})
//chossingg medciinnee
app.get("/fetch-med-ngo", function (req, resp) {
    let cityy = req.query.c;
    myysqlcon.query("select distinct LOWER(TRIM(medicines26.medname)) AS medname from medicines26 inner join dprofiles on medicines26.emailid=dprofiles.email_id where dprofiles.city=?", [cityy], function (err, result) {
        if (err == null) resp.send(result);
        else resp.send(err.message);
    })
})

app.get("/ngo-profile", function (req, resp) {
    var path = __dirname + "/public/ngo-profile.html";
    resp.sendFile(path);
})

app.get("/fetch-med-cardss", function (req, resp) {
    let medicinee = req.query.m;
    let cityy = req.query.c;
    myysqlcon.query("select * from medicines26 inner join dprofiles on medicines26.emailid = dprofiles.email_id  where medicines26.medname =? and dprofiles.city =? ", [medicinee, cityy], function (err, result) {
        if (err == null) {
            resp.send(result);
        }
        else {
            resp.send(err.message);
        }
    })
})



//eqp ngo
app.get("/fetch-eqp-ngo", function (req, resp) {
    let cityy = req.query.c;
    myysqlcon.query("SELECT DISTINCT LOWER(TRIM(equipments.equipment)) AS equipment from equipments inner join dprofiles on equipments.emailid=dprofiles.email_id where dprofiles.city=?", [cityy], function (err, result) {
        if (err == null) resp.send(result);
        else resp.send(err.message);
    })
})


app.get("/fetch-eqp-cardss", function (req, resp) {
    let eqp = req.query.m;
    let c = req.query.c;
    myysqlcon.query("select * from equipments inner join dprofiles on equipments.emailid = dprofiles.email_id  where equipments.equipment =? and dprofiles.city =? ", [eqp, c], function (err, result) {
        if (err == null) resp.send(result);
        else resp.send(err.message);

    })
})

//ngo registration form
app.post("/ngoprof", async function (req, resp) {
    let msg = "file not uploaed";
    let myyurl = "nopic.jpg";
    if (req.files && req.files.ngoimg) {

        let fileName = req.files.ngoimg.name;
        let fullPath = __dirname + "/uploads/" + fileName;  //
        await req.files.ngoimg.mv(fullPath);
        //   resp.send(fileName);
        msg = "file uploaded";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myyurl = picUrlResult.url;
            console.log("");
            console.log(myyurl);
        });
    }
    let e = req.body.ngoEmailn;
    let n = req.body.ngonamen;
    let o = req.body.ngooffn;
    let c = req.body.ngocityn;
    let w = req.body.ngowebn;
    let co = req.body.ngocontactn;
    let s = req.body.ngodaten;
    let ch = req.body.ngochairn;
    let i = req.body.ngoinfon;
    let reg = req.body.ngoregn;
    myysqlcon.query("insert into ngos values(?,?,?,?,?,?,?,?,?,?,?)", [e, n, o, c, w, co, s, ch, i, reg, myyurl], function (err) {
        if (err) {
            resp.send(err.message);
        }
        else {
            resp.send("record saved")
        }
    })

})


app.get("/ngo-finder", function (req, resp) {
    var path = __dirname + "/public/ngo-finder.html";
    resp.sendFile(path);
})

app.get("/fetch-distinctngo-cities", function (req, resp) {
    myysqlcon.query("select distinct LOWER(TRIM(city)) AS city from ngos ORDER BY city", function (err, result) {
        if (err == null) {
            resp.send(result);
        }
        else resp.send(err.message);
    })
})
app.get("/show-ngos", function (req, resp) {
    let c = req.query.city;
    myysqlcon.query("select * from ngos where city=?", [c], function (err, result) {
        if (err) {
            resp.send(err.message);
        }
        else {
            resp.send(result);
        }
    })
})

/////============needy dashboard
app.get("/needy-dashboard", function (req, resp) {
    var path = __dirname + "/public/needy-dash.html";
    resp.sendFile(path);
})

app.get("/starting-page", function (req, resp) {
    var path = __dirname + "/public/startingpage.html";
    resp.sendFile(path);
})


//needy prfile with gen ai 

app.get("/needy-profile", function (req, resp) {
    var path = __dirname + "/public/needy-profile.html";
    resp.sendFile(path);
})

//ai read pic 
//gen ai 
//aiaiaiaiaiaiaiiaiaiiiaiaiaiaiaiaiaiaiiaiaiaiaiaiaiiaiaiaiaiaiaiaiiaiaiaiaiaiiaiaiaia
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


app.post("/ai-read-pic", async function(req,resp){

//we have now urls of both now send to chirag that we have that will scan imag e
async function AakritiChirag(imgurl) {
const myprompt="read the text on picture and tell all the information in adhaar card and give output strictly  in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."   
const imageResp = await fetch(imgurl)
        .then((response)=>response.arrayBuffer());

console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY);
console.log("GEMINI KEY LENGTH:", process.env.GEMINI_API_KEY?.length);
const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
        { text: myprompt },
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
    ],
});
console.log(result.text)
const cleaned=result.text.replace(/```json|```/g,' ').trim();
const jsonData=JSON.parse(cleaned);
console.log(jsonData);
return jsonData;
    }

//front
let jsonbacka;
let jsonfronta;
let msg1 = "file not uploaed";
let myyurl1 = "nopic.jpg";
if (req.files  && req.files.afrontpic) {

let fileNameA = req.files.afrontpic.name;
let fullPathA = __dirname + "/uploads/" + fileNameA;  //
await req.files.afrontpic.mv(fullPathA);
//   resp.send(fileName);
msg1 = "file uploaded";

await cloudinary.uploader.upload(fullPathA).then(async function (picUrlResult) {
myyurl1 = picUrlResult.url;
console.log("");
console.log(myyurl1);
jsonfronta =await AakritiChirag(myyurl1);
        });
    }

//back
let msg2 = "file not uploaed";
let myyurl2 = "nopic.jpg";
if (req.files  && req.files.abackpic) {

let fileNameb = req.files.abackpic.name;
let fullPathb = __dirname + "/uploads/" + fileNameb;  //
await req.files.abackpic.mv(fullPathb);
//   resp.send(fileName);
msg2 = "file uploaded";

await cloudinary.uploader.upload(fullPathb).then( async function (picUrlResult) {
myyurl2 = picUrlResult.url;
console.log("");
console.log(myyurl2);
jsonbacka =await AakritiChirag(myyurl2);
        });
    }


let e=req.body.txtemailn;
let m=req.body.txtmobilen;
let a=jsonfronta.adhaar_number;
let n=jsonfronta.name;
myysqlcon.query("insert into needys values (?,?,?,?,?,?)",[e,m,n,a,myyurl1,myyurl2],function(err,result){
if(err==null){
resp.redirect("needy-dash.html");
    }
else{
resp.send(err.message);
    }
})
})

//admin
app.post("/admin-login", function(req, resp) {

    let passkey = req.body.passkey;

    if (passkey === "AAKRITISITE@MEDICO") {

        resp.json({
            success: true
        });

    } else {

        resp.json({
            success: false
        });

    }

});