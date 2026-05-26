/* =========================================
   LÓGICA DE DETALLES: ANALOGUE POCKET (RECURSOS CDN)
   ========================================= */

const productData = {
  flavors: {
    black: {
      name: "Chasis Black",
      icon: "⬛",
      // Imagen Frontal Principal
      main: "https://res.cloudinary.com/dn8pns203/image/upload/v1777401872/geekwave_catalog/vybuwhqgbpi4hi4nxom4.webp",
      // Galería completa del modelo Black
      gallery: [
        "https://res.cloudinary.com/dn8pns203/image/upload/v1777401872/geekwave_catalog/vybuwhqgbpi4hi4nxom4.webp", // Frontal
        "https://res.cloudinary.com/dn8pns203/image/upload/v1777401873/geekwave_catalog/hkh80zcxx5hci35cxxhm.webp", // Posterior
        "https://res.cloudinary.com/dn8pns203/image/upload/v1777401874/geekwave_catalog/cq6hbuxovqkfm3zuwnfn.webp"  // Superior
      ],
      description: "El estándar de ingeniería. Un acabado negro mate texturizado que evoca la estética clásica, albergando el sistema FPGA dual capaz de replicar ciclos de hardware con precisión absoluta."
    },
    white: {
      name: "Chasis White",
      icon: "⬜",
      // Imagen Frontal Principal (Cerahite)
      main: "https://res.cloudinary.com/dn8pns203/image/upload/v1777401874/geekwave_catalog/ywos3mcw8lwsv4aghdku.webp",
      // Galería completa del modelo Cerahite/White
      gallery: [
        "https://res.cloudinary.com/dn8pns203/image/upload/v1777401874/geekwave_catalog/ywos3mcw8lwsv4aghdku.webp", // Frontal
        "https://res.cloudinary.com/dn8pns203/image/upload/v1777401875/geekwave_catalog/l9roi8hkdwqztfbbdurm.webp", // Lateral
        "https://res.cloudinary.com/dn8pns203/image/upload/v1777401875/geekwave_catalog/nd9yy2izwhplgli7avxo.webp", // Posterior
        "https://res.cloudinary.com/dn8pns203/image/upload/v1777401876/geekwave_catalog/xejjdgcatgzvd9a7k2qp.webp"  // Superior
      ],
      description: "Minimalismo técnico. La versión White destaca la pureza de la pantalla LCD de 615 ppi, manteniendo la misma arquitectura Altera Cyclone para una ejecución nativa sin precedentes.[cite: 2]"
    }
  },

  plans: {
    standard: {
      price: "$219.99",
      benefits: [
        "Consola Analogue Pocket Original[cite: 2]",
        "Cable USB-C de alta velocidad",
        "Protector de pantalla pre-instalado"
      ],
      buttonText: "RESERVAR EDICIÓN BASE"
    },
    bundle: {
      price: "$299.99",
      benefits: [
        "Consola Analogue Pocket[cite: 2]",
        "Analogue Dock (Salida HDMI 1080p)",
        "Hard Case de policarbonato",
        "Envío prioritario Geekwave"
      ],
      buttonText: "RESERVAR DELUXE BUNDLE"
    }
  }
};

let selectedFlavor = "black";
let selectedPlan = "standard";
let quantity = 1;

function renderSelectors() {
  const flavorContainer = document.getElementById("flavorContainer");
  const galleryThumbs = document.getElementById("galleryThumbs");
  const mainImage = document.getElementById("mainProductImage");

  if (!flavorContainer || !galleryThumbs) return;

  flavorContainer.innerHTML = "";
  galleryThumbs.innerHTML = "";

  const currentFlavor = productData.flavors[selectedFlavor];

  // 1. Renderizar selectores de color (Chasis)
  Object.entries(productData.flavors).forEach(([key, flavor]) => {
    const button = document.createElement("button");
    button.className = `flavor-btn ${selectedFlavor === key ? "active" : ""}`;
    button.innerHTML = `<span>${flavor.icon} ${flavor.name}</span>`;
    button.onclick = () => { 
      selectedFlavor = key; 
      updateUI(); 
    };
    flavorContainer.appendChild(button);
  });

  // 2. Renderizar galería de miniaturas según el color seleccionado
  currentFlavor.gallery.forEach((imgUrl) => {
    const thumb = document.createElement("div");
    thumb.className = `thumb ${mainImage.src === imgUrl ? "active" : ""}`;
    thumb.innerHTML = `<img src="${imgUrl}" alt="Vista de la consola">`;
    thumb.onclick = () => {
      mainImage.src = imgUrl; // Cambia la imagen principal al hacer clic en la miniatura
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    };
    galleryThumbs.appendChild(thumb);
  });
}

function updateUI() {
  const flavor = productData.flavors[selectedFlavor];
  const mainImage = document.getElementById("mainProductImage");
  const description = document.getElementById("productDescription");

  if (mainImage) mainImage.src = flavor.main; // Al cambiar de color, vuelve a la vista frontal
  if (description) description.textContent = flavor.description;

  renderSelectors();
  renderPlanDetails();
}

// Reutilizamos el resto de funciones (renderPlanDetails, quantity logic, accordions) del script anterior[cite: 3]
function renderPlanDetails() {
  const currentPlan = productData.plans[selectedPlan];
  const benefitsList = document.getElementById("benefitsList");
  const cartButton = document.getElementById("cartButton");

  if (benefitsList) {
    benefitsList.innerHTML = currentPlan.benefits
      .map(b => `<li><i class="fa-solid fa-circle-check"></i> ${b}</li>`)
      .join("");
  }
  if (cartButton) {
    cartButton.innerHTML = `${currentPlan.buttonText} <i class="fa-solid fa-chevron-right"></i>`;
  }
}

document.querySelectorAll(".plan").forEach(planCard => {
  planCard.onclick = () => {
    selectedPlan = planCard.dataset.plan;
    document.querySelectorAll(".plan").forEach(p => p.classList.remove("active"));
    planCard.classList.add("active");
    updateUI();
  };
});

document.getElementById("increaseQty").onclick = () => {
  quantity++;
  document.getElementById("quantityValue").textContent = quantity;
};

document.getElementById("decreaseQty").onclick = () => {
  if (quantity > 1) {
    quantity--;
    document.getElementById("quantityValue").textContent = quantity;
  }
};
document.querySelectorAll(".accordion-header").forEach(header => {
  header.addEventListener("click", () => {
    const item = header.parentElement;
    item.classList.toggle("active");

    const icon = header.querySelector("i");
    icon.classList.toggle("fa-plus");
    icon.classList.toggle("fa-minus");
  });
});
document.addEventListener("DOMContentLoaded", updateUI);

// Función para deslizar hacia la zona de compra/reserva
function scrollToPurchase() {
    const detailsPanel = document.querySelector('.product-details');
    const purchaseBox = document.querySelector('.purchase-box');
    
    if (detailsPanel && purchaseBox) {
        // Desliza el panel interno hacia la posición de la caja de compra
        detailsPanel.scrollTo({
            top: purchaseBox.offsetTop - 20,
            behavior: 'smooth'
        });
    }
}

// Actualiza tu función updateUI para incluir el scroll suave
function updateUI() {
    const flavor = productData.flavors[selectedFlavor];
    const mainImage = document.getElementById("mainProductImage");
    const description = document.getElementById("productDescription");

    if (mainImage) mainImage.src = flavor.main;
    if (description) {
        // Efecto visual de desvanecimiento antes de cambiar el texto
        description.style.opacity = 0;
        setTimeout(() => {
            description.textContent = flavor.description;
            description.style.opacity = 1;
        }, 200);
    }

    renderSelectors();
    renderPlanDetails();
    
    // Opcional: Solo hace scroll si el usuario ya interactuó
    // scrollToPurchase(); 
}

// Vincula el scroll a los selectores de chasis y planes
document.querySelectorAll(".plan").forEach(planCard => {
    const originalClick = planCard.onclick;
    planCard.onclick = (e) => {
        if (originalClick) originalClick(e);
        scrollToPurchase();
    };
});

// En renderSelectors(), añade el scroll al evento click de los botones de chasis
// Dentro de tu bucle de flavors:
// button.onclick = () => { selectedFlavor = key; updateUI(); scrollToPurchase(); };