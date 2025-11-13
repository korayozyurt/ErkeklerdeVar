document.addEventListener('DOMContentLoaded', () => {
    const playerCar = document.getElementById('player-car');
    const message = document.getElementById('message');
    
    // Araba pozisyonu ve fizik değerleri
    let posX = 20;
    let posY = 20;
    let rotation = 0;
    let velocity = 0;
    let steeringAngle = 0; // Direksiyon açısı

    // Fizik sabitleri
    const acceleration = 0.1;
    const friction = 0.05;
    const maxVelocity = 4;
    const reverseMaxVelocity = -2;
    const steeringSpeed = 3; // Direksiyonun dönüş hızı

    // Hangi tuşların basılı tutulduğunu takip et
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

    // Dokunma başladığında tuşu 'basılı' olarak ayarla
    const handleTouchStart = (key) => (e) => {
        e.preventDefault();
        keys[key] = true;
    };
    
    // Dokunma bittiğinde tuşu 'bırakılmış' olarak ayarla
    const handleTouchEnd = (key) => (e) => {
        e.preventDefault();
        keys[key] = false;
    };

    // Olayları butonlara bağla (hem dokunmatik hem de fare tıklaması için)
    btnUp.addEventListener('touchstart', handleTouchStart('ArrowUp'));
    btnUp.addEventListener('touchend', handleTouchEnd('ArrowUp'));
    btnUp.addEventListener('mousedown', handleTouchStart('ArrowUp'));
    btnUp.addEventListener('mouseup', handleTouchEnd('ArrowUp'));
    btnUp.addEventListener('mouseleave', handleTouchEnd('ArrowUp')); // Eğer fare buton dışına çıkarsa

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


    // 3. Oyun Döngüsü (Game Loop)
    function gameLoop() {
        // ----- FİZİK HESAPLAMALARI -----

        // 1. İvmelenme (Gaz/Fren)
        if (keys.ArrowUp) {
            velocity += acceleration;
        } else if (keys.ArrowDown) {
            velocity -= acceleration;
        }

        // 2. Sürtünme
        if (velocity > 0) {
            velocity -= friction;
            if (velocity < 0) velocity = 0;
        } else if (velocity < 0) {
            velocity += friction;
            if (velocity > 0) velocity = 0;
        }

        // 3. Hız Limitleri
        if (velocity > maxVelocity) velocity = maxVelocity;
        if (velocity < reverseMaxVelocity) velocity = reverseMaxVelocity;

        // 4. Direksiyon (Sadece araç hareket ediyorsa döner)
        steeringAngle = 0;
        if (Math.abs(velocity) > 0.1) { // Sadece hareket varsa
            if (keys.ArrowLeft) {
                steeringAngle = -steeringSpeed;
            }
            if (keys.ArrowRight) {
                steeringAngle = steeringSpeed;
            }
            
            // Dönüşü hıza göre ayarla (Geri giderken ters döner)
            rotation += steeringAngle * (velocity / maxVelocity);
        }

        // 5. Pozisyon Güncelleme
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
            velocity = 0; // Arabayı durdur
            // Oyunu durdurmak için döngüyü temizle (isteğe bağlı)
            // clearInterval(gameInterval);
        } else if (checkParking()) {
            message.textContent = "🏆 MÜKEMMEL PARK!";
            playerCar.style.backgroundColor = '#28a745';
            velocity = 0;
            // Oyunu durdur
            clearInterval(gameInterval);
        } else {
            message.textContent = "Aracı park edin.";
            playerCar.style.backgroundColor = 'transparent';
        }
    }

    // Çarpışma Kontrolü (Sokak sınırları)
    function checkCollision() {
        const streetWidth = 450;
        const streetHeight = 200;
        const carWidth = 40;
        const carHeight = 60;

        // X sınırları
        if (posX < 0 || posX > streetWidth - carWidth) return true;
        // Y sınırları (Yol çizgileri arası)
        if (posY < 20 || posY > streetHeight - carHeight + 20) return true;
        
        // TODO: Diğer arabalara çarpma kontrolü eklenebilir
        
        return false;
    }

    // Park Kontrolü
    function checkParking() {
        // Hedef Park Alanı (parked-left ve parked-right arası)
        const targetMinX = 50; // parked-left'in sağı (50px + 50px genişlik + boşluk)
        const targetMaxX = 100; // parked-right'ın solu (450px - 50px - 50px genişlik - boşluk)
        const targetMinY = 50;  // Kaldırıma yakın (100px)
        const targetMaxY = 130; // Kaldırıma yakın (100px)

        // Düz park edilmeli (0 derece veya 360'ın katları)
        const isRotationCorrect = (Math.abs(rotation % 360) < 10 || Math.abs(rotation % 360) > 350);
        // Hızı çok düşük olmalı
        const isSlow = Math.abs(velocity) < 0.5;

        console.log(posX);
        if (posX >= targetMinX && posX <= targetMaxX &&
            posY >= targetMinY && posY <= targetMaxY &&
            isRotationCorrect && isSlow) {
            return true;
        }
        return false;
    }

    // Oyunu başlat (60 FPS)
    const gameInterval = setInterval(gameLoop, 1000 / 60);
});