const axios = require ("axios");
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const nodemailer = require("nodemailer");

const config = {
    urls: [
        {
            label:"Speedmax CFR Disc Di2",
            url: "https://www.canyon.com/en-ca/road-bikes/triathlon-bikes/speedmax/cfr/speedmax-cfr-disc-di2/2921.html?dwvar_2921_pv_rahmenfarbe=SR%2FBK"
        },
        {
            label:"Speedmax CFR Disc LTD",
            url: "https://www.canyon.com/en-ca/road-bikes/triathlon-bikes/speedmax/cfr/speedmax-cfr-disc-ltd/3028.html?dwvar_3028_pv_rahmenfarbe=BK%2FBK"
        },
        {
            label:"Speedmax CFR Disc eTap",
            url: "https://www.canyon.com/en-ca/road-bikes/triathlon-bikes/speedmax/cfr/speedmax-cfr-disc-etap/3065.html?dwvar_3065_pv_rahmenfarbe=BU%2FBK"
        },
        {
            label:"Speedmax CFR Disc LTD",
            url: "https://www.canyon.com/en-ca/road-bikes/triathlon-bikes/speedmax/cfr/speedmax-cfr-disc-di2/2921.html?dwvar_2921_pv_rahmenfarbe=SR%2FBK"
        },
            {
                label: "Neuron 6 Blue",
                url: "https://www.canyon.com/en-ca/mountain-bikes/trail-bikes/neuron/al/neuron-6/3156.html?dwvar_3156_pv_rahmenfarbe=BU"
            },
            {
                label: "Neuron 5 Grey",
                url: "https://www.canyon.com/en-ca/mountain-bikes/trail-bikes/neuron/al/neuron-5/3155.html?dwvar_3155_pv_rahmenfarbe=GY%2FBK"
            },
            {   
                label: "Neuron 5 Red",
                url: "https://www.canyon.com/en-ca/mountain-bikes/trail-bikes/neuron/al/neuron-5/3155.html?dwvar_3155_pv_rahmenfarbe=RD"
            }
        ],
    sizes: [
        "S", "M"
    ]
    
}

const TOEMAIL = process.env.TOEMAIL;
const FROMNAME = process.env.FROMNAME;
const USERNAME = process.env.GMAILUSER;
const PASSWORD = process.env.GMAILPASSWORD;

async function getBikePage(url) {
    
    try {
        const bikeResponse = await axios.get(url);
        console.log(`response status for ${url} - ${bikeResponse.status}`)
        //console.log(JSON.stringify(bikeResponse.data))
        return await bikeResponse.data;
    } catch(e){
        console.error(e.message);
    }
}

function parseBikeSizes(bikePage) {

    const dom = new JSDOM(bikePage);
   
    var availableNodes = dom.window.document.querySelectorAll('button.js-productConfigurationSelect');
    const availableSizes = [];
    console.log(JSON.stringify(availableNodes))
    if (availableNodes) {
        availableNodes.forEach( node => availableSizes.push(node.attributes.getNamedItem('data-product-size').value))
    } 

    return availableSizes;
}

async function findBike(url) {
    console.log(`requesting bike info for ${url.label} at ${url.url}...`);
    const bikePage = await getBikePage(url.url);
    const availableSizes = await parseBikeSizes(bikePage);

    const desiredSizes = availableSizes.filter(size => config.sizes.includes(size));

    if (desiredSizes && desiredSizes.length > 0){
        desiredSizes.forEach(async size => 
            {
                console.log(`${url.label} is available in size ${size}`);
                notifyAvailableBike(url.label, size);
            });
    } else {
        console.log(`${url.label} not available in desired sizes`);
    }
}

async function notifyAvailableBike(bike, size){

    let message = `${bike} is now available in size ${size}`;

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: USERNAME,
            pass: PASSWORD,
        },
        tls:{rejectUnauthorized:false}
    });

    let info = await transporter.sendMail({
        from: `${FROMNAME} <${USERNAME}>`,
        to: TOEMAIL, 
        subject: `${bike} is now available in size ${size}`,
        

    });
}

function findAvailableBikes() {
    config.urls.forEach(url => findBike(url));
}


setInterval(findAvailableBikes, 5000);