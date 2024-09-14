import PengajuanContainer from "./_components/pengajuan-container";

const PengajuanPage = () => {
  //data daftar pengajuan sesuai tahun aktif dan unit kerjanya
  //jika ada satu saja pengajuan yang di ajukan, maka status kegiatan menjadi "pengajuan" sehingga bisa mulai muncul di proses verifikasi
  const dataKegiatan = [];
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col">
      <h1 className="m-2">Alur Proses &gt; Pengajuan </h1>
      <PengajuanContainer />
    </div>
  );
};

export default PengajuanPage;
