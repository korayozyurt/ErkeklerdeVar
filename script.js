document.addEventListener('DOMContentLoaded', () => {
    const playerCar = document.getElementById('player-car');
    const message = document.getElementById('message');

    var totalDistance = 0;
    
    // initial pos
    let posX = 20;
    let posY = 20;
    let rotation = 0;
    let velocity = 0;
    let steeringAngle = 0; 

    // physics
    const acceleration = 0.1;
    const friction = 0.05;
    const maxVelocity = 4;
    const reverseMaxVelocity = -2;
    const steeringSpeed = 3; 

    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    // 1. Klavye Kontrolleri
    document.addEventListener('keydown', (e) => {
        if (keys[e.key] !== undefined) {
            keys[e.key] = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keys[e.key] !== undefined) {
            keys[e.key] = false;
            e.preventDefault();
        }
    });

    // 2. Mobil Dokunmatik Kontroller
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    // Dokunma başladığında e tuşu 'basılı olacak
    const handleTouchStart = (key) => (e) => {
        e.preventDefault();
        keys[key] = true;
    };
    
    // Dokunma bittiğinde e tuşu bırakılma olacak
    const handleTouchEnd = (key) => (e) => {
        e.preventDefault();
        keys[key] = false;
    };

    // mobile button
    btnUp.addEventListener('touchstart', handleTouchStart('ArrowUp'));
    btnUp.addEventListener('touchend', handleTouchEnd('ArrowUp'));
    btnUp.addEventListener('mousedown', handleTouchStart('ArrowUp'));
    btnUp.addEventListener('mouseup', handleTouchEnd('ArrowUp'));
    btnUp.addEventListener('mouseleave', handleTouchEnd('ArrowUp')); // fare buton dışına çıkarsa

    btnDown.addEventListener('touchstart', handleTouchStart('ArrowDown'));
    btnDown.addEventListener('touchend', handleTouchEnd('ArrowDown'));
    btnDown.addEventListener('mousedown', handleTouchStart('ArrowDown'));
    btnDown.addEventListener('mouseup', handleTouchEnd('ArrowDown'));
    btnDown.addEventListener('mouseleave', handleTouchEnd('ArrowDown'));

    btnLeft.addEventListener('touchstart', handleTouchStart('ArrowLeft'));
    btnLeft.addEventListener('touchend', handleTouchEnd('ArrowLeft'));
    btnLeft.addEventListener('mousedown', handleTouchStart('ArrowLeft'));
    btnLeft.addEventListener('mouseup', handleTouchEnd('ArrowLeft'));
    btnLeft.addEventListener('mouseleave', handleTouchEnd('ArrowLeft'));

    btnRight.addEventListener('touchstart', handleTouchStart('ArrowRight'));
    btnRight.addEventListener('touchend', handleTouchEnd('ArrowRight'));
    btnRight.addEventListener('mousedown', handleTouchStart('ArrowRight'));
    btnRight.addEventListener('mouseup', handleTouchEnd('ArrowRight'));
    btnRight.addEventListener('mouseleave', handleTouchEnd('ArrowRight'));


    //  (Game Loop)
    function gameLoop() {
        // ----- FİZİK  -----

        // İvmelenme 
        if (keys.ArrowUp) {
            velocity += acceleration;
            totalDistance += velocity;
        } else if (keys.ArrowDown) {
            velocity -= acceleration;
        }

        if(totalDistance > 200) {
            window.alert('Hamle Hakkınız doldu');
        }

        // Sürtünme
        if (velocity > 0) {
            velocity -= friction;
            if (velocity < 0) velocity = 0;
        } else if (velocity < 0) {
            velocity += friction;
            if (velocity > 0) velocity = 0;
        }

        // 3Hız Limitleri
        if (velocity > maxVelocity) velocity = maxVelocity;
        if (velocity < reverseMaxVelocity) velocity = reverseMaxVelocity;

        // Direksiyon 
        steeringAngle = 0;
        if (Math.abs(velocity) > 0.1) { // Sadece hareket varsa
            if (keys.ArrowLeft) {
                steeringAngle = -steeringSpeed;
            }
            if (keys.ArrowRight) {
                steeringAngle = steeringSpeed;
            }
            
            // Dönüşü hıza göre ayarla 
            rotation += steeringAngle * (velocity / maxVelocity);
        }

        // Pozisyon Güncelleme
        const rad = rotation * (Math.PI / 180);
        // Dönüş açısına göre X ve Y hareketini hesapla
        posX += velocity * Math.sin(rad); // 0 derecede sin(0)=0 (X hareketi yok)
        posY += velocity * Math.cos(rad); // 0 derecede cos(0)=1 (Y hareketi tam)

        // ----- GÖRSEL GÜNCELLEME -----
        playerCar.style.left = `${posX}px`;
        playerCar.style.bottom = `${posY}px`;
        playerCar.style.transform = `rotate(${rotation}deg)`;

        // ----- KONTROLLER (Çarpışma ve Park) -----
        if (checkCollision()) {
            message.textContent = "KAZA YAPTIN! 💥";
            playerCar.style.backgroundColor = '#dc3545';
            velocity = 0; 
            // Oyunu durdurmak için
            // clearInterval(gameInterval);
        } else if (checkParking()) {
            message.textContent = "🏆 MÜKEMMEL PARK!";
            playerCar.style.backgroundColor = '#28a745';
            velocity = 0;
            // Oyunu durdur
            clearInterval(gameInterval);
            setTimeout(() => {
            localStorage.setItem('login', 'parked');
            window.location.href = '/erkeklergunu.html';
            },750);

        } else {
            message.textContent = "Aracı park edin.";
            playerCar.style.backgroundColor = 'transparent';
        }
    }

    function checkCollision() {
        const streetWidth = 450;
        const streetHeight = 200;
        const carWidth = 40;
        const carHeight = 60;

        if (posX <= 0 || posX > streetWidth - carWidth) return true;
        if (posY <= 0 || posY > streetHeight - carHeight) return true;
        
        return false;
    }

    function checkParking() {
        const targetMinX = 50; // parked-left'in sağı (50px + 50px genişlik + boşluk)
        const targetMaxX = 100; // parked-right'ın solu (450px - 50px - 50px genişlik - boşluk)
        const targetMinY = 50;  // Kaldırıma yakın (100px)
        const targetMaxY = 130; // Kaldırıma yakın (100px)

        // Düz park edilmeli (0 derece veya 360'ın katları)
        const isRotationCorrect = (Math.abs(rotation % 360) < 10 || Math.abs(rotation % 360) > 350);
        // Hızı çok düşük olmalı
        const isSlow = Math.abs(velocity) < 0.5;

        if (posX >= targetMinX && posX <= targetMaxX &&
            posY >= targetMinY && posY <= targetMaxY &&
            isRotationCorrect && isSlow) {
            return true;
        }
        return false;
    }

    // (60 FPS)
    const gameInterval = setInterval(gameLoop, 1000 / 60);
});