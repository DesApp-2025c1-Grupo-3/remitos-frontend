// src/services/georefService.ts

// Servicios para datos geográficos dinámicos
export const paisesService = {
  async getProvincias() {
    const res = await fetch('https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre');
    const data = await res.json();
    return (data.provincias || []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
  },
  async getLocalidadesByProvincia(provinciaId: string) {
    const res = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${provinciaId}&campos=id,nombre&max=5000`);
    const data = await res.json();
    return (data.localidades || []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
  },
  // Uruguay: departamentos y localidades (ejemplo, puedes ajustar endpoint real si lo tienes)
  async getDepartamentosUY() {
    // Aquí deberías poner el endpoint real de Uruguay si lo tienes
    // return fetch(...)
    return [];
  },
  async getLocalidadesByDepartamentoUY(deptoId: string) {
    // Aquí deberías poner el endpoint real de Uruguay si lo tienes
    // return fetch(...)
    return [];
  }
};
