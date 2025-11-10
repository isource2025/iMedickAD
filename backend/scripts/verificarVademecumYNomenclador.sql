-- Verificar estructura de imVademecum
SELECT TOP 3
    Troquel,
    Nombre,
    Laboratorio
FROM imVademecum
WHERE Troquel IS NOT NULL
ORDER BY Troquel DESC;

-- Verificar estructura de VUnionModuladasNomenclador
SELECT TOP 3
    IDPractica,
    Descripcion,
    Codigo
FROM VUnionModuladasNomenclador
WHERE IDPractica IS NOT NULL;

-- Probar JOIN con medicamentos de la visita 43900
SELECT 
    m.IdCtrlMedicamento,
    m.Troquel,
    v.Nombre as NombreMedicamento,
    v.Laboratorio,
    m.Cantidad,
    m.TipoUnidad
FROM imInterCtrlMedicamento m
LEFT JOIN imVademecum v ON m.Troquel = v.Troquel
WHERE m.IdVisita = 43900;

-- Probar JOIN con prácticas de alguna visita
SELECT TOP 5
    p.IdPractica,
    p.Practica as IDPractica,
    n.Descripcion as NombrePractica,
    n.Codigo,
    p.Cantidad,
    p.Tipo
FROM imFacPracticas p
LEFT JOIN VUnionModuladasNomenclador n ON p.Practica = n.IDPractica
WHERE p.NumeroVisita IS NOT NULL
ORDER BY p.IdPractica DESC;
