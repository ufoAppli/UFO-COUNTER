const STORAGE_KEY = 'ufo-counter-data';
const pages = ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'pageA', 'pageB'];
const categories = {
  machine: [
    { label: '2本爪 小型', color: 'rgb(117,250,141)' },
    { label: '2本爪 中型', color: 'rgb(123, 223, 29)' },
    { label: '3本爪 超小型', color: 'rgb(35, 187, 15)' },
    { label: '3本爪 小型', color: 'rgb(76, 154, 238)' },
    { label: '3本爪 中型', color: 'rgb(63, 98, 238)' },
    { label: '3本爪 大型', color: 'rgb(13, 67, 245)' },
    { label: '特殊', color: 'rgb(212, 95, 247)' },
    { label: 'その他', color: 'rgb(101, 91, 91)' }
  ],
  prizeType: [
    { label: 'ぬい', color: 'rgb(117,250,141)' },
    { label: 'フィギュア(箱)', color: 'rgb(123, 223, 29)' },
    { label: '食品(箱)', color: 'rgb(35, 187, 15)' },
    { label: '食品(非箱)', color: 'rgb(76, 154, 238)' },
    { label: '雑貨(箱)', color: 'rgb(63, 98, 238)' },
    { label: '雑貨(非箱)', color: 'rgb(13, 67, 245)' },
    { label: 'その他', color: 'rgb(101, 91, 91)' }
  ],
  prizeSize: [
    { label: '小型10以下', color: 'rgb(117,250,141)' },
    { label: '中型10～20', color: 'rgb(123, 223, 29)' },
    { label: '大型20～30', color: 'rgb(35, 187, 15)' },
    { label: '超大型30以上', color: 'rgb(76, 154, 238)' },
    { label: 'その他', color: 'rgb(101, 91, 91)' }
  ],
  hook: [
    { label: '橋渡し', color: 'rgb(117,250,141)' },
    { label: '山積み/ドカ盛', color: 'rgb(123, 223, 29)' },
    { label: 'スライド/ハの字', color: 'rgb(35, 187, 15)' },
    { label: 'フック/S字', color: 'rgb(76, 154, 238)' },
    { label: 'Cリング/Dリング', color: 'rgb(63, 98, 238)' },
    { label: 'リング/ペラ輪', color: 'rgb(13, 67, 245)' },
    { label: '鳥よけ/剣山', color: 'rgb(119,155,253)' },
    { label: '平置き', color: 'rgb(129,253,248)' },
    { label: 'その他', color: 'rgb(101, 91, 91)' }
  ]
};

const state = {
  currentPage: 'page1',
  shopName: '',
  shopId: null,
  currentMachine: {},
  currentMachinePhoto: null,
  currentStorePhoto: null,
  photoTarget: null,
  selectedShopId: null,
  shops: []
};

const elements = {
  message: document.getElementById('message'),
  shopNameInput: document.getElementById('shopNameInput'),
  summaryText: document.getElementById('summaryText'),
  photoPreviewContainer: document.getElementById('photoPreviewContainer'),
  photoPreview: document.getElementById('photoPreview'),
  cameraInput: document.getElementById('cameraInput'),
  machineButtons: document.getElementById('machineButtons'),
  prizeTypeButtons: document.getElementById('prizeTypeButtons'),
  prizeSizeButtons: document.getElementById('prizeSizeButtons'),
  hookButtons: document.getElementById('hookButtons'),
  shopButtons: document.getElementById('shopButtons'),
  dataDetails: document.getElementById('dataDetails'),
  shopDetailTitle: document.getElementById('shopDetailTitle')
};

function loadStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.shops = [];
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('不正な形式');
    }
    state.shops = parsed;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    state.shops = [];
    showMessage('保存データが破損していたため、データをリセットしました。');
  }
}

function saveStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.shops));
    return true;
  } catch (error) {
    showMessage('データ保存に失敗しました。ストレージ容量が不足している可能性があります。');
    return false;
  }
}

function showMessage(text, duration = 5000) {
  elements.message.textContent = text;
  elements.message.classList.remove('hidden');
  if (state.messageTimeout) {
    clearTimeout(state.messageTimeout);
  }
  state.messageTimeout = setTimeout(() => {
    elements.message.classList.add('hidden');
  }, duration);
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeShopName(rawValue) {
  let name = rawValue.trim();
  if (!name) {
    name = generateDefaultShopName();
  }
  return makeUniqueShopName(name);
}

function generateDefaultShopName() {
  let index = 1;
  while (state.shops.some(shop => shop.name === `店舗${index}`)) {
    index += 1;
  }
  return `店舗${index}`;
}

function makeUniqueShopName(baseName) {
  if (!state.shops.some(shop => shop.name === baseName)) {
    return baseName;
  }

  let index = 2;
  while (state.shops.some(shop => shop.name === `${baseName}${index}`)) {
    index += 1;
  }
  return `${baseName}${index}`;
}

function getCurrentShop() {
  return state.shops.find(shop => shop.id === state.shopId) || null;
}

function createNewShop(name) {
  const shop = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
    storePhotos: [],
    machines: []
  };
  state.shops.push(shop);
  saveStorage();
  return shop;
}

function ensureCurrentShop(name) {
  if (state.shopId) {
    const existing = getCurrentShop();
    if (existing) {
      return existing;
    }
  }
  const shop = createNewShop(name);
  state.shopId = shop.id;
  return shop;
}

function showPage(pageId) {
  state.currentPage = pageId;
  pages.forEach((page) => {
    const element = document.getElementById(page);
    if (element) {
      element.classList.toggle('active', page === pageId);
    }
  });

  if (pageId === 'page2') {
    elements.shopNameInput.value = state.shopName || '';
    elements.shopNameInput.focus();
  }

  if (pageId === 'page3') {
    renderChoiceButtons(elements.machineButtons, categories.machine, 'machine');
  }
  if (pageId === 'page4') {
    renderChoiceButtons(elements.prizeTypeButtons, categories.prizeType, 'prizeType');
  }
  if (pageId === 'page5') {
    renderChoiceButtons(elements.prizeSizeButtons, categories.prizeSize, 'prizeSize');
  }
  if (pageId === 'page6') {
    renderChoiceButtons(elements.hookButtons, categories.hook, 'hook');
  }
  if (pageId === 'page7') {
    updateSummary();
  }
  if (pageId === 'pageA') {
    renderShopList();
  }
  if (pageId === 'pageB') {
    renderShopDetails();
  }
}

function renderChoiceButtons(container, list, key) {
  container.innerHTML = '';
  list.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-button';
    button.textContent = item.label;
    button.style.backgroundColor = item.color;
    button.dataset.choiceKey = key;
    button.dataset.choiceValue = item.label;
    button.addEventListener('click', () => chooseCategory(key, item.label));
    container.appendChild(button);
  });
}

function chooseCategory(key, value) {
  state.currentMachine[key] = value;
  if (key === 'machine') {
    delete state.currentMachine.prizeType;
    delete state.currentMachine.prizeSize;
    delete state.currentMachine.hook;
    state.currentMachinePhoto = null;
    state.currentStorePhoto = null;
    showPage('page4');
    return;
  }
  if (key === 'prizeType') {
    delete state.currentMachine.prizeSize;
    delete state.currentMachine.hook;
    state.currentMachinePhoto = null;
    showPage('page5');
    return;
  }
  if (key === 'prizeSize') {
    delete state.currentMachine.hook;
    state.currentMachinePhoto = null;
    showPage('page6');
    return;
  }
  if (key === 'hook') {
    showPage('page7');
  }
}

function updateSummary() {
  const machine = state.currentMachine.machine || '未選択';
  const prizeType = state.currentMachine.prizeType || '未選択';
  const prizeSize = state.currentMachine.prizeSize || '未選択';
  const hook = state.currentMachine.hook || '未選択';
  const summary = `現在の入力内容：\n機種：${machine}\nプライズ種類：${prizeType}\n大きさ：${prizeSize}\n仕掛け：${hook}`;
  elements.summaryText.textContent = summary;

  if (state.currentMachinePhoto) {
    elements.photoPreview.src = state.currentMachinePhoto;
    elements.photoPreviewContainer.classList.remove('hidden');
  } else {
    elements.photoPreviewContainer.classList.add('hidden');
  }
}

function renderShopList() {
  elements.shopButtons.innerHTML = '';
  if (state.shops.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = '登録された店舗データがありません。';
    empty.style.color = '#333';
    empty.style.padding = '1rem';
    elements.shopButtons.appendChild(empty);
    return;
  }

  state.shops.forEach((shop) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'primary-button button-large';
    button.textContent = shop.name;
    button.addEventListener('click', () => {
      state.selectedShopId = shop.id;
      showPage('pageB');
    });
    elements.shopButtons.appendChild(button);
  });
}

function renderShopDetails() {
  const shop = state.shops.find((item) => item.id === state.selectedShopId);
  if (!shop) {
    showPage('pageA');
    return;
  }
  elements.shopDetailTitle.textContent = `データ表示：${shop.name}`;
  elements.dataDetails.innerHTML = '';

  const counts = buildShopCounts(shop);

  elements.dataDetails.appendChild(createDetailSection('機種', counts.machine, (key, value) => `${key}: ${value}`));
  elements.dataDetails.appendChild(createDetailSection('プライズ', counts.prize, (key, value) => `${key}: ${value}`));
  elements.dataDetails.appendChild(createDetailSection('仕掛け', counts.hook, (key, value) => `${key}: ${value}`));
  elements.dataDetails.appendChild(createDetailSection('筐体データ', counts.combination, (key, value) => `${key}: ${value}`));
  elements.dataDetails.appendChild(createPhotoGallery(shop));
}

function createPhotoGallery(shop) {
  const section = document.createElement('div');
  section.className = 'detail-section';

  const header = document.createElement('div');
  header.className = 'detail-summary';
  header.innerHTML = '<span>写真</span><span>▼</span>';
  section.appendChild(header);

  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.display = 'block';
  section.appendChild(content);

  const photos = [];

  if (Array.isArray(shop.storePhotos)) {
    shop.storePhotos.forEach((photo) => {
      photos.push({ label: photo.name || '店舗写真', src: photo.photo, type: '店舗' });
    });
  }

  shop.machines.forEach((machine) => {
    if (machine.photo) {
      photos.push({ label: `${machine.machineCategory || '機種'} / ${machine.prizeType || ''}`.trim(), src: machine.photo, type: '筐体' });
    }
  });

  if (photos.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'detail-row';
    empty.textContent = '写真がありません。';
    content.appendChild(empty);
    return section;
  }

  const list = document.createElement('div');
  list.className = 'photo-gallery-list';

  photos.forEach((photo) => {
    const card = document.createElement('div');
    card.className = 'photo-card';

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.label;

    const caption = document.createElement('div');
    caption.className = 'photo-card-caption';
    caption.textContent = `${photo.type}：${photo.label}`;

    card.appendChild(img);
    card.appendChild(caption);
    list.appendChild(card);
  });

  content.appendChild(list);
  return section;
}

function buildShopCounts(shop) {
  const machine = {};
  const prize = {};
  const hook = {};
  const combination = {};

  shop.machines.forEach((item) => {
    if (!item.machineCategory || !item.prizeType || !item.prizeSize || !item.hookType) {
      return;
    }
    machine[item.machineCategory] = (machine[item.machineCategory] || 0) + 1;
    const prizeKey = `${item.prizeType}-${item.prizeSize}`;
    prize[prizeKey] = (prize[prizeKey] || 0) + 1;
    hook[item.hookType] = (hook[item.hookType] || 0) + 1;
    const comboKey = `${item.machineCategory}-${item.prizeType}-${item.prizeSize}-${item.hookType}`;
    combination[comboKey] = (combination[comboKey] || 0) + 1;
  });

  const sortCounts = (counts) => Object.keys(counts).sort((a, b) => a.localeCompare(b, 'ja')).map((key) => ({ key, value: counts[key] }));

  return {
    machine: sortCounts(machine),
    prize: sortCounts(prize),
    hook: sortCounts(hook),
    combination: sortCounts(combination)
  };
}

function createDetailSection(title, rows, formatRow) {
  const section = document.createElement('div');
  section.className = 'detail-section';

  const summary = document.createElement('button');
  summary.className = 'detail-summary';
  summary.type = 'button';
  summary.innerHTML = `<span>${title}</span><span>▶</span>`;
  section.appendChild(summary);

  const content = document.createElement('div');
  content.className = 'detail-content';
  section.appendChild(content);

  if (rows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'detail-row';
    empty.textContent = 'データがありません。';
    content.appendChild(empty);
  } else {
    rows.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'detail-row';
      row.textContent = formatRow(item.key, item.value);
      content.appendChild(row);
    });
  }

  summary.addEventListener('click', () => {
    const isOpen = section.classList.toggle('open');
    summary.querySelector('span:last-child').textContent = isOpen ? '▼' : '▶';
  });

  return section;
}

function capturePhoto(target) {
  state.photoTarget = target;
  elements.cameraInput.value = '';
  elements.cameraInput.click();
}

function buildPhotoDownloadName(target, shopName, dataUrl) {
  const safeName = (shopName || 'photo').replace(/[\\/:*?"<>|]/g, '').slice(0, 30) || 'photo';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const mimeMatch = dataUrl.match(/^data:(.+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const extension = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('webp')
      ? 'webp'
      : 'jpg';
  const label = target === 'store' ? 'store' : 'machine';
  return `${safeName}-${label}-${timestamp}.${extension}`;
}

function savePhotoViaWeb(dataUrl, target) {
  const shopName = (state.shopName || elements.shopNameInput.value || '').trim();
  const fileName = buildPhotoDownloadName(target, shopName, dataUrl);
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  return true;
}

function handleFileSelection(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    if (state.photoTarget === 'store') {
      const shop = ensureCurrentShop(state.shopName || elements.shopNameInput.value);
      shop.storePhotos.push({ id: generateId(), name: shop.name, photo: dataUrl, createdAt: new Date().toISOString() });
      saveStorage();
      savePhotoViaWeb(dataUrl, 'store');
      showMessage('店舗写真を保存しました。一覧画面でも確認できます。');
      showPage('page3');
      state.currentStorePhoto = dataUrl;
      return;
    }
    if (state.photoTarget === 'machine') {
      savePhotoViaWeb(dataUrl, 'machine');
      state.currentMachinePhoto = dataUrl;
      updateSummary();
      showMessage('筐体写真を保存しました。一覧画面でも確認できます。');
      return;
    }
  };
  reader.onerror = () => {
    showMessage('画像の読み込みに失敗しました。');
  };
  reader.readAsDataURL(file);
}

function saveCurrentMachine() {
  const shop = getCurrentShop();
  if (!shop) {
    showMessage('まず店舗名を入力してください。');
    showPage('page2');
    return false;
  }

  if (!state.currentMachine.machine || !state.currentMachine.prizeType || !state.currentMachine.prizeSize || !state.currentMachine.hook) {
    showMessage('すべての項目を選択してください。');
    return false;
  }

  shop.machines.push({
    id: generateId(),
    machineCategory: state.currentMachine.machine,
    prizeType: state.currentMachine.prizeType,
    prizeSize: state.currentMachine.prizeSize,
    hookType: state.currentMachine.hook,
    photo: state.currentMachinePhoto || null,
    createdAt: new Date().toISOString()
  });
  saveStorage();
  return true;
}

function resetCurrentMachine(keepMachine = false) {
  if (!keepMachine) {
    state.currentMachine = {};
  }
  state.currentMachinePhoto = null;
}

function handleNavigation(action) {
  switch (action) {
    case 'startCount':
      resetCurrentMachine();
      state.currentStorePhoto = null;
      state.shopId = null;
      state.shopName = '';
      showPage('page2');
      break;
    case 'viewData':
      showPage('pageA');
      break;
    case 'saveShop':
      const rawName = elements.shopNameInput.value;
      const normalizedName = normalizeShopName(rawName);
      state.shopName = normalizedName;
      state.shopId = null;
      ensureCurrentShop(normalizedName);
      showPage('page3');
      break;
    case 'cameraStore':
      const rawStoreName = elements.shopNameInput.value;
      const normalizedStoreName = normalizeShopName(rawStoreName);
      state.shopName = normalizedStoreName;
      state.shopId = null;
      ensureCurrentShop(normalizedStoreName);
      capturePhoto('store');
      break;
    case 'backToHome':
      showPage('page1');
      break;
    case 'backToShopName':
      state.currentMachine = {};
      state.currentMachinePhoto = null;
      showPage('page2');
      break;
    case 'backToMachine':
      delete state.currentMachine.prizeType;
      delete state.currentMachine.prizeSize;
      delete state.currentMachine.hook;
      state.currentMachinePhoto = null;
      showPage('page3');
      break;
    case 'backToPrizeType':
      delete state.currentMachine.prizeSize;
      delete state.currentMachine.hook;
      state.currentMachinePhoto = null;
      showPage('page4');
      break;
    case 'backToPrizeSize':
      delete state.currentMachine.hook;
      state.currentMachinePhoto = null;
      showPage('page5');
      break;
    case 'backToHook':
      delete state.currentMachine.hook;
      state.currentMachinePhoto = null;
      showPage('page6');
      break;
    case 'cameraMachine':
      capturePhoto('machine');
      break;
    case 'nextCount':
      if (!saveCurrentMachine()) {
        return;
      }
      resetCurrentMachine();
      showPage('page3');
      break;
    case 'repeatCount':
      if (!saveCurrentMachine()) {
        return;
      }
      state.currentMachinePhoto = null;
      updateSummary();
      showMessage('同じ条件で保存しました。写真は次回撮影時に設定されます。');
      break;
    case 'redoCount':
      resetCurrentMachine();
      showPage('page3');
      break;
    case 'endCount':
      if (!saveCurrentMachine()) {
        return;
      }
      resetCurrentMachine();
      showPage('page1');
      break;
    case 'backToShopList':
      state.selectedShopId = null;
      showPage('pageA');
      break;
    case 'deleteShop':
      deleteCurrentShop();
      break;
    case 'exportCsv':
      exportCurrentShopCsv();
      break;
    default:
      break;
  }
}

function deleteCurrentShop() {
  if (!state.selectedShopId) {
    return;
  }
  const index = state.shops.findIndex((shop) => shop.id === state.selectedShopId);
  if (index === -1) {
    return;
  }
  state.shops.splice(index, 1);
  saveStorage();
  state.selectedShopId = null;
  showPage('pageA');
  showMessage('データを削除しました。');
}

function sanitizeExportFileName(value) {
  return String(value || 'photo')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .slice(0, 40) || 'photo';
}

function getPhotoExtensionFromDataUrl(dataUrl) {
  const mimeMatch = dataUrl.match(/^data:(.+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  if (mimeType.includes('png')) {
    return 'png';
  }
  if (mimeType.includes('webp')) {
    return 'webp';
  }
  return 'jpg';
}

function buildPhotoExportEntries(shop) {
  const entries = [];

  const addPhoto = (kind, photo, index, label) => {
    if (!photo || !photo.photo) {
      return;
    }
    const extension = getPhotoExtensionFromDataUrl(photo.photo);
    const fileName = `${sanitizeExportFileName(label)}-${kind}-${index + 1}.${extension}`;
    entries.push({ fileName, dataUrl: photo.photo });
  };

  (shop.storePhotos || []).forEach((photo, index) => addPhoto('store', photo, index, shop.name));

  shop.machines.forEach((machine, index) => {
    if (machine.photo) {
      const label = [machine.machineCategory, machine.prizeType, machine.prizeSize, machine.hookType].filter(Boolean).join('-') || `machine-${index + 1}`;
      addPhoto('machine', { photo: machine.photo }, index, label);
    }
  });

  return entries;
}

async function exportCurrentShopCsv() {
  const shop = state.shops.find((item) => item.id === state.selectedShopId);
  if (!shop) {
    return;
  }

  if (typeof JSZip === 'undefined') {
    showMessage('ZIP作成ライブラリの読み込みに失敗しました。');
    return;
  }

  const header = ['機種', 'プライズ種類', 'プライズサイズ', '仕掛け', '数', '店舗写真', '筐体写真'];
  const counts = buildShopCounts(shop).combination;
  const photoEntries = buildPhotoExportEntries(shop);
  const photoFileNames = photoEntries.map((entry) => entry.fileName);

  const rows = counts.map((item) => {
    const [machineCategory, prizeType, prizeSize, hookType] = item.key.split('-');
    const matchingMachines = shop.machines.filter((entry) => entry.machineCategory === machineCategory && entry.prizeType === prizeType && entry.prizeSize === prizeSize && entry.hookType === hookType);
    const storePhotos = (shop.storePhotos || []).map((photo) => photo.photo || '').filter(Boolean);
    const machinePhotos = matchingMachines.map((entry) => entry.photo || '').filter(Boolean);

    return [
      machineCategory,
      prizeType,
      prizeSize,
      hookType,
      item.value.toString(),
      storePhotos.length > 0 ? `${storePhotos.length}件` : '',
      machinePhotos.length > 0 ? `${machinePhotos.length}件` : ''
    ];
  });

  const csvRows = [header, ...rows].map((cells) => cells.map((cell) => {
    const normalized = String(cell ?? '').replace(/\r?\n/g, ' ').replace(/"/g, '""');
    return `"${normalized}"`;
  }).join(',')).join('\r\n');
  const bom = '\uFEFF';
  const csvData = bom + csvRows;

  const zip = new JSZip();
  zip.file(`${sanitizeExportFileName(shop.name)}.csv`, csvData, { type: 'text/plain;charset=shift_jis' });

  const photoBlobs = await Promise.all(photoEntries.map(async (entry) => {
    const response = await fetch(entry.dataUrl);
    const blob = await response.blob();
    return { fileName: entry.fileName, blob };
  }));

  photoBlobs.forEach((photo) => {
    zip.file(`photos/${photo.fileName}`, photo.blob, { binary: true });
  });

  if (photoFileNames.length === 0) {
    zip.file('photos/README.txt', '写真はありません。');
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${sanitizeExportFileName(shop.name)}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  showMessage('写真付きZIPを出力しました。CSVと画像ファイルをまとめてダウンロードできます。');
}

function attachHandlers() {
  document.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', () => handleNavigation(button.dataset.action));
  });
  elements.cameraInput.addEventListener('change', handleFileSelection);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {
      console.warn('Service Worker の登録に失敗しました。');
    });
  }
}

function init() {
  loadStorage();
  attachHandlers();
  renderChoiceButtons(elements.machineButtons, categories.machine, 'machine');
  renderChoiceButtons(elements.prizeTypeButtons, categories.prizeType, 'prizeType');
  renderChoiceButtons(elements.prizeSizeButtons, categories.prizeSize, 'prizeSize');
  renderChoiceButtons(elements.hookButtons, categories.hook, 'hook');
  showPage('page1');
  registerServiceWorker();
}

init();
