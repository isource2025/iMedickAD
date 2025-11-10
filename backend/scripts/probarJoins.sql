-- Probar JOIN de medicamentos con vademecum para la visita 43900
SELECT TOP 5
    m.IDCtrlMedica,
    m.FechaControl,
    m.HoraControl,
    m.Troquel,
    v.Nombre as NombreMedicamento,
    v.Laboratorio,
    v.Presentacion,
    m.Cantidad,
    m.TipoUnidad
FROM imInterCtrlMedicamento m
LEFT JOIN imVademecum v ON m.Troquel = v.Troquel
WHERE m.NumeroVisita = 43900
ORDER BY m.FechaControl DESC, m.HoraControl DESC;

-- Probar JOIN de prácticas con nomenclador para visitas recientes
SELECT TOP 5
    p.Valor,
    p.NumeroVisita,
    p.FechaPractica,
    p.TipoPractica,
    p.Practica as IDPractica,
    n.Descripcion as NombrePractica,
    n.Tipo as TipoNomenclador,
    p.CantidadPractica
FROM imFacPracticas p
LEFT JOIN VUnionModuladasNomenclador n ON p.Practica = n.IDPractica
WHERE p.NumeroVisita IS NOT NULL
  AND p.Practica IS NOT NULL
ORDER BY p.Valor DESC;
