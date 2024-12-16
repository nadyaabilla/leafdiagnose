// Tangkap elemen-elemen DOM
const dropArea = document.getElementById('dropArea');
const predictForm = document.getElementById('predictForm');
const previewImg = document.getElementById('previewImg');

const waitingToPredicting = document.querySelector('.result-container #waitingToPredicting');
const loadingPredict = document.querySelector('.result-container .loading');
const predictionError = document.querySelector('.result-container #predictionError');
const result = document.querySelector('.result-container #result');

// Data form untuk dikirim ke server
const predictFormData = new FormData();

// Mencegah perilaku default pada event drag-and-drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

// Fungsi mencegah perilaku default
function preventDefaults(event) {
  event.preventDefault();
  event.stopPropagation();
}

// Tambahkan highlight pada area drop saat file sedang di-drag
['dragenter', 'dragover'].forEach((eventName) => {
  dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
});

// Hapus highlight saat file keluar dari area drop
['dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
});

// Tangani file yang di-drop pada area
dropArea.addEventListener('drop', (event) => {
  const files = event.dataTransfer.files;
  handleFileSelection(files[0]);
});

// Tangani file yang dipilih melalui input form
predictForm.elements.plantFile.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  handleFileSelection(files[0]);
});

// Tangani pengiriman form untuk prediksi
predictForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!predictFormData.has('image')) {
    alert('Silakan pilih gambar Anda terlebih dahulu');
    return;
  }
  await uploadFile(predictFormData);
});

// Fungsi untuk memproses file yang dipilih
function handleFileSelection(file) {
  try {
    validateFile(file);
    predictFormData.set('image', file, file.name);
    previewFile(file);
  } catch (error) {
    predictionError.textContent = error.message;
    predictionError.style.display = 'block';
  }
}

// Fungsi validasi file (jenis dan ukuran)
function validateFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png'];
  const maxSizeInMB = 5;

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Jenis file tidak valid. Harap unggah file dengan format JPEG atau PNG.');
  }

  if (file.size > maxSizeInMB * 1024 * 1024) {
    throw new Error(`Ukuran file terlalu besar. Maksimal ${maxSizeInMB}MB.`);
  }
}

// Tampilkan pratinjau file gambar
function previewFile(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    previewImg.innerHTML = ''; // Bersihkan elemen pratinjau sebelumnya
    const img = document.createElement('img');
    img.src = reader.result;
    img.alt = 'Pratinjau Gambar';
    previewImg.appendChild(img);
  };
}

// Kirim data gambar ke server
async function uploadFile(formData) {
  try {
    // Tampilkan loader dan sembunyikan elemen lain
    waitingToPredicting.style.display = 'none';
    loadingPredict.style.display = 'block';
    predictionError.style.display = 'none';

    // Panggil API untuk prediksi
    const response = await PredictAPI.predict(formData);

    if (response.status !== 'success') {
      throw new Error(response.message || 'Terjadi kesalahan pada server.');
    }

    // Tampilkan hasil prediksi dari respons API
    const { result: diseaseName, confidenceScore, suggestion: prevention } = response.data;
    const diseaseDetails = `Keyakinan model: ${(confidenceScore * 100).toFixed(2)}%`;
    const treatment = 'Pengobatan belum tersedia. Mohon konsultasi lebih lanjut.';

    showPredictionResult({ diseaseName, diseaseDetails, prevention, treatment });
  } catch (error) {
    // Tampilkan error pada halaman
    predictionError.textContent = error.message;
    predictionError.style.display = 'block';
  } finally {
    // Sembunyikan loader
    loadingPredict.style.display = 'none';
  }
}

// Tampilkan hasil prediksi
function showPredictionResult({ diseaseName, diseaseDetails, prevention, treatment }) {
  result.style.display = 'block';
  result.innerHTML = `
    <strong>Nama Penyakit:</strong> ${diseaseName}<br />
    <strong>Detail Penyakit:</strong><br />
    <p>${diseaseDetails}</p>
    <strong>Cara Pencegahan:</strong><br />
    <p>${prevention}</p>
    <strong>Cara Pengobatan:</strong><br />
    <p>${treatment}</p>
  `;
}
