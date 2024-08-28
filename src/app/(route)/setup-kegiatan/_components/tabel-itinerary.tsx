const TabelItinerary = () => {
  return (
    <div>
      <table className="table table-bordered table-hover w-full">
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal Mulai</th>
            <th>Tanggal Akhir</th>
            <th>Negara</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr className="odd:bg-gray-100 even:bg-white border border-gray-200">
            <td>1</td>
            <td>01 Jan 2024</td>
            <td>06 Jan 2024</td>
            <td>Prancis</td>
            <td>
              <button className="btn btn-sm btn-warning">Edit</button>
              <button className="btn btn-sm btn-danger">Hapus</button>
            </td>
          </tr>
          <tr className="odd:bg-gray-100 even:bg-white border border-gray-200">
            <td>2</td>
            <td>01 Jan 2024</td>
            <td>06 Jan 2024</td>
            <td>Prancis</td>
            <td>
              <button className="btn btn-sm btn-warning">Edit</button>
              <button className="btn btn-sm btn-danger">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TabelItinerary;
