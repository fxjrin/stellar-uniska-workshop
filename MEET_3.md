# Meet 3 - Deploy ke Mainnet

Panduan ini mencakup perubahan kode dari sesi sebelumnya (Meet 2) dan langkah-langkah
deploy frontend ke production menggunakan Vercel.

---

## Perubahan dari Meet 2

### 1. Hapus Hello World

Section Hello World dihapus karena sudah tidak digunakan di sesi ini.

**Hapus baris import berikut di `src/App.jsx`:**

```js
// HAPUS baris ini
import { CONTRACT_ID as HELLO_CONTRACT_ID } from '../contracts/hello.js'
```

**Hapus state berikut:**

```js
// HAPUS tiga baris ini
const [helloInput, setHelloInput] = useState('')
const [helloResult, setHelloResult] = useState(null)
const [helloLoading, setHelloLoading] = useState(false)
```

**Hapus handler `handleHello`:**

```js
// HAPUS seluruh fungsi ini
const handleHello = async (e) => {
  e.preventDefault()
  setHelloLoading(true)
  setError(null)
  setHelloResult(null)
  try {
    const contract = await kit.contract(HELLO_CONTRACT_ID)
    const { result } = await contract.hello.invoke(helloInput.trim())
    setHelloResult(result)
  } catch (err) {
    setError('Hello failed: ' + err.message)
  } finally {
    setHelloLoading(false)
  }
}
```

**Hapus section JSX Hello World:**

```jsx
// HAPUS seluruh section ini
<section className="hello-section">
  <h2 className="section-title">Hello World</h2>
  ...
</section>
```

---

### 2. Update stellar-contracts-kit ke v0.1.1

Di `package.json`, update versi library:

```json
"stellar-contracts-kit": "^0.1.1"
```

Lalu jalankan:

```sh
npm install stellar-contracts-kit@0.1.1
```

---

### 3. Pindah ke Mainnet

Ganti konfigurasi kit di `src/App.jsx` dari:

```js
// BEFORE - testnet
const kit = new StellarContractsKit({ network: 'testnet' })
```

Menjadi:

```js
// AFTER - mainnet
const kit = new StellarContractsKit({ network: 'mainnet' })
```

Di v0.1.1, default mainnet sudah menggunakan `https://mainnet.sorobanrpc.com` (public, gratis,
tanpa API key). Itulah kenapa kita update library-nya terlebih dahulu sebelum ganti network.

---

### 4. Generate contract binding untuk Mainnet

Jalankan perintah berikut dari folder `frontend`:

```sh
npx sck generate --network mainnet \
  --contract-id CBOXUHO7WVFINZ472NPHOK6I5DHEYC3HH5MMAOZQJVVW43IGS5VYR5CV \
  --out-dir contracts \
  --name notes
```

Perintah ini akan update file `contracts/notes.js` dengan CONTRACT_ID dan type
yang sesuai dari kontrak mainnet.

---

### 5. Update network badge di header

Di `src/App.jsx`, cari baris:

```jsx
<span className="network-badge">Testnet</span>
```

Ganti menjadi:

```jsx
<span className="network-badge">Mainnet</span>
```

---

## Contract Mainnet

Kontrak Notes yang sudah di-deploy ke Stellar Mainnet:

| Info | Value |
|---|---|
| Contract ID | `CBOXUHO7WVFINZ472NPHOK6I5DHEYC3HH5MMAOZQJVVW43IGS5VYR5CV` |
| Network | Stellar Mainnet |
| Functions | `create_note`, `get_notes`, `delete_note` |

Cek kontrak di Stellar Expert:
`https://stellar.expert/explorer/public/contract/CBOXUHO7WVFINZ472NPHOK6I5DHEYC3HH5MMAOZQJVVW43IGS5VYR5CV`

---

## Git - Dari Awal Sampai Push

### Langkah 1 - Inisialisasi repo

Dari folder project (bukan subfolder):

```sh
git init
git branch -M main
```

### Langkah 2 - Buat .gitignore

Buat file `.gitignore` di root folder:

```
node_modules/
dist/
.env
.env.local
```

### Langkah 3 - Stage semua file

```sh
git add .
```

Cek apa saja yang akan di-commit:

```sh
git status
```

### Langkah 4 - Commit pertama

```sh
git commit -m "initial commit"
```

### Langkah 5 - Buat repository di GitHub

1. Buka `https://github.com/new`
2. Isi nama repository, contoh: `stellar-notes-dapp`
3. Set ke Public
4. Jangan centang "Add a README file" (kita sudah punya)
5. Klik "Create repository"

### Langkah 6 - Hubungkan ke GitHub

Copy perintah yang ditampilkan GitHub, atau jalankan:

```sh
git remote add origin https://github.com/<username>/<nama-repo>.git
```

### Langkah 7 - Push ke GitHub

```sh
git push -u origin main
```

Setelah ini, setiap ada perubahan cukup jalankan:

```sh
git add .
git commit -m "pesan commit"
git push
```

---

## Deploy ke Vercel

### Cara 1 - Import dari GitHub (direkomendasikan)

1. Buka `https://vercel.com/new`
2. Klik "Import Git Repository"
3. Pilih repo yang sudah di-push
4. Set Root Directory ke `frontend`
5. Klik "Deploy"

### Cara 2 - Vercel CLI

```sh
npm i -g vercel
cd frontend
vercel
```

Ikuti instruksi di terminal. Vercel akan otomatis detect Vite dan set build command
yang benar.
