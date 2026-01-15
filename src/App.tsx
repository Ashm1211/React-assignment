import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { useRef } from 'react';


import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';


import { useEffect, useState } from "react";
import type { ApiResponse } from "./types";

/* ---------------- TYPES ---------------- */

type Artwork = {
  id: number;
  title: string;
  artist_display: string;
};

type PageEvent = {
  page: number;
};

/* ---------------- APP ---------------- */

export default function App() {



  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- FETCH FUNCTION ---------------- */

  const fetchArtworks = async (pageNumber: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber}&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch artworks");
      }

      const json: ApiResponse = await response.json();
      setArtworks(json.data);
    } catch (err) {
      setError("Something went wrong while fetching data");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchArtworks(page);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [page]);

  /* ---------------- HANDLERS ---------------- */

  const handlePageChange = (e: PageEvent) => {
    setPage(e.page); // No undefined issue
  };

  /* ---------------- UI ---------------- */

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const selectedRows = artworks.filter((art) =>
  selectedIds.has(art.id)
);
const onSelectionChange = (e: any) => {
  const newIds = new Set(selectedIds);

  e.value.forEach((art: Artwork) => {
    newIds.add(art.id);
  });

  artworks.forEach((art) => {
    if (!e.value.find((a: Artwork) => a.id === art.id)) {
      newIds.delete(art.id);
    }
  });

  setSelectedIds(newIds);
};


const overlayRef = useRef<OverlayPanel>(null);
const [selectCount, setSelectCount] = useState<number | null>(null);

const handleCustomSelection = () => {
  if (!selectCount || selectCount <= 0) return;

  const newSelectedIds = new Set(selectedIds);

  const rowsToSelect = artworks.slice(0, selectCount);

  rowsToSelect.forEach((art) => {
    newSelectedIds.add(art.id);
  });

  setSelectedIds(newSelectedIds);
  overlayRef.current?.hide();
};



  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Artworks</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Button
  label="Custom Select Rows"
  icon="pi pi-check-square"
  onClick={(e) => overlayRef.current?.toggle(e)}
  style={{ marginBottom: '10px' }}
/>
<OverlayPanel ref={overlayRef}>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <span>Select rows from current page</span>

    <InputNumber
      value={selectCount}
      onValueChange={(e) => setSelectCount(e.value)}
      min={1}
      max={artworks.length}
      placeholder="Enter number"
    />

    <Button
      label="Select"
      onClick={handleCustomSelection}
    />
  </div>
</OverlayPanel>


    <DataTable
  value={artworks}
  loading={loading}
  
  lazy
  rows={10}
  first={(page - 1) * 10}
  onPage={(e) => setPage((e.page ?? 0) + 1)}
  selection={selectedRows}
  onSelectionChange={onSelectionChange}
  dataKey="id">

  <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
  <Column field="title" header="Title" />
  <Column field="artist_display" header="Artist" />
</DataTable>



      <div style={{ marginTop: "20px" }}>
        <button style={{ marginTop: "20px", color: "white",  }}
          disabled={page === 1}
          onClick={() => handlePageChange({ page: page - 1 })}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>Page {page}</span>

        <button style={{ marginTop: "20px", color: "white",  }} onClick={() => handlePageChange({ page: page + 1 })}>
          Next
        </button>
      </div>
    </div>
  );
}
