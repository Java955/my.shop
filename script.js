/* =========================
   🛒 CART SYSTEM
========================= */

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let deliveryFee = parseInt(localStorage.getItem("deliveryFee")) || 0;

/* =========================
   💎 ADD TO CART (INDEX PAGE)
========================= */
function addToCart(name, price){
    cart.push({name, price});
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(name + " added to cart!");
    updateCartCount();
}

/* =========================
   🔢 CART COUNTER
========================= */
function updateCartCount(){
    let el = document.getElementById("cart-count");
    if(el){
        el.innerText = cart.length;
    }
}

/* =========================
   🛒 RENDER CART (CART PAGE)
========================= */
function renderCart(){
    let cartDiv = document.getElementById("cart");
    if(!cartDiv) return;

    cartDiv.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        cartDiv.innerHTML += `
        <div class="cart-item">
            <div>
                ${item.name}<br>
                $${item.price}
            </div>
            <button onclick="removeItem(${index})">Remove</button>
        </div>
        `;
    });

    let finalTotal = total + deliveryFee;

    let totalEl = document.getElementById("total");
    if(totalEl){
        totalEl.innerText = finalTotal;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   ❌ REMOVE ITEM
========================= */
function removeItem(index){
    cart.splice(index, 1);
    renderCart();
    updateCartCount();
}

/* =========================
   📍 DISTANCE CALCULATION
========================= */
const SHOP_LAT = 0.3476;
const SHOP_LON = 32.5825;

function getDistance(lat1, lon1, lat2, lon2){
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*Math.PI/180) *
        Math.cos(lat2*Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/* =========================
   📍 GPS LOCATION PICKER
========================= */
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("GPS not supported");
    }
}

function showPosition(position){
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    let addressField = document.getElementById("customerAddress");
    if(addressField){
        addressField.value = `https://www.google.com/maps?q=${lat},${lon}`;
    }

    let distance = getDistance(SHOP_LAT, SHOP_LON, lat, lon);

    if(distance <= 2){
        deliveryFee = 2000;
    } else if(distance <= 5){
        deliveryFee = 4000;
    } else if(distance <= 10){
        deliveryFee = 7000;
    } else {
        deliveryFee = 10000;
    }

    localStorage.setItem("deliveryFee", deliveryFee);

    alert("Delivery Fee: " + deliveryFee + " UGX");

    renderCart();
}

/* =========================
   📱 WHATSAPP ORDER SYSTEM
========================= */
function sendWhatsAppOrder(){

    let name = document.getElementById("customerName")?.value;
    let phone = document.getElementById("customerPhone")?.value;
    let address = document.getElementById("customerAddress")?.value;

    if(!name || !phone || !address){
        alert("Please fill all details!");
        return;
    }

    if(cart.length === 0){
        alert("Cart is empty!");
        return;
    }

    let orderId = "JWL-" + Math.floor(Math.random()*1000000);

    let message = `🛒 NEW ORDER%0A%0A🧾 Order ID: ${orderId}%0A👤 Name: ${name}%0A📱 Phone: ${phone}%0A📍 Address: ${address}%0A%0A`;

    let productTotal = 0;

    cart.forEach(item => {
        message += `• ${item.name} - $${item.price}%0A`;
        productTotal += item.price;
    });

    let grandTotal = productTotal + deliveryFee;

    message += `%0A💰 Products: $${productTotal}%0A🚚 Delivery: $${deliveryFee}%0A💰 TOTAL: $${grandTotal}`;

    /* SAVE ORDER FOR TRACKING */
    localStorage.setItem("lastOrder", JSON.stringify({
        orderId,
        name,
        phone,
        address,
        items: cart,
        status: "Processing"
    }));

    let shopNumber = "256701234567";

    window.open(`https://wa.me/${shopNumber}?text=${message}`, "_blank");
}

/* =========================
   🚀 INIT PAGE
========================= */
updateCartCount();
renderCart();