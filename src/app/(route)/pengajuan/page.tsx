import PengajuanContainer from "./_components/pengajuan-container";

const PengajuanPage = () => {
  //data daftar pengajuan sesuai tahun aktif dan unit kerjanya
  const dataKegiatan = [];
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col">
      <h1>Pengajuan</h1>
      <PengajuanContainer />
    </div>
  );
};

export default PengajuanPage;
