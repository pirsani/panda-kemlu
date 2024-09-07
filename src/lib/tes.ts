interface hewan {
  nama: string;
  umur: number;
}

const kucin: hewan = {
  nama: "kucing",
  umur: 2,
};

interface ability {
  makan: boolean;
  minum: boolean;
}

interface hewanPeliharaan extends hewan {
  pemilik: string;
  ability?: ability;
}

const hewanPeliharaan: hewanPeliharaan = {
  nama: "kambing",
  umur: 2,
  pemilik: "budi",
};
