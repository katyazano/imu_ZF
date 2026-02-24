const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando la siembra exhaustiva para pruebas de ZF...');

  // ==========================================
  // 1. CATÁLOGOS BASE (Operativos)
  // ==========================================
  console.log('1. Generando Catálogos Operativos...');
  const rolesMap = {};
  for (const r of ['Administrador', 'Usuario General', 'Gerente', 'S&R', 'EHS', 'Seguridad', 'Auditor']) {
    rolesMap[r] = await prisma.roles.upsert({ where: { nombre: r }, update: {}, create: { nombre: r } });
  }

  const areasMap = {};
  for (const a of ['Sistemas', 'Validación HIL', 'Mantenimiento', 'Ciberseguridad']) {
    areasMap[a] = await prisma.disciplinas_areas.upsert({ where: { nombre: a }, update: {}, create: { nombre: a } });
  }

  const catMap = {};
  for (const c of ['Laptops', 'Sensores', 'Motores', 'Refacciones', 'Osciloscopios']) {
    catMap[c] = await prisma.categorias_activos.upsert({ where: { nombre: c }, update: {}, create: { nombre: c } });
  }

  const estMap = {};
  for (const e of ['Operativa', 'En mantenimiento', 'Prestada', 'Dada de baja']) {
    estMap[e] = await prisma.estados_maquina.upsert({ where: { nombre: e }, update: {}, create: { nombre: e } });
  }

  const ubiMap = {};
  for (const u of ['Almacén Central ADAS', 'Laboratorio de Pruebas A', 'Caseta de Seguridad', 'Estante de Refacciones B2']) {
    ubiMap[u] = await prisma.ubicaciones_fisicas.upsert({ where: { nombre: u }, update: {}, create: { nombre: u } });
  }

  // ==========================================
  // 2. CATÁLOGOS FINANCIEROS Y ADUANALES
  // ==========================================
  console.log('2. Generando Catálogos Financieros y Aduanales...');
  
  const proyMap = {};
  for (const p of ['Proyecto Validación SIL', 'Proyecto Pilot Gen2', 'Infraestructura IT', 'Mantenimiento General']) {
    proyMap[p] = await prisma.centros_costo_proyectos.upsert({ where: { nombre: p }, update: {}, create: { nombre: p } });
  }

  const tCompraMap = {};
  for (const t of ['Importación', 'Nacional', 'Arrendamiento', 'Donación']) {
    tCompraMap[t] = await prisma.tipos_compra.upsert({ where: { nombre: t }, update: {}, create: { nombre: t } });
  }

  const tNacMap = {};
  for (const n of ['Definitiva', 'Temporal', 'Propia']) {
    tNacMap[n] = await prisma.tipos_nacionalidad.upsert({ where: { nombre: n }, update: {}, create: { nombre: n } });
  }

  await prisma.destinos_externos.upsert({
    where: { id_destino: 1 }, update: {},
    create: { nombre_institucion: 'Tecmilenio', tipo: 'Universidad', contacto_nombre: 'Profesor Guía', contacto_email: 'guia@tecmilenio.mx' }
  });

  // ==========================================
  // 3. USUARIOS (9 Usuarios)
  // ==========================================
  console.log('3. Creando usuarios...');
  const pass = 'test1234';

  const usuariosTest = [
    { email: 'admin@zf.com', rol: 'Administrador', area: 'Sistemas', nombre: 'Admin Supremo' },
    { email: 'gerente@zf.com', rol: 'Gerente', area: 'Validación HIL', nombre: 'Gerente Aprobador' },
    // 3 Usuarios Generales para que varios puedan pedir cosas al mismo tiempo
    { email: 'usuario1@zf.com', rol: 'Usuario General', area: 'Validación HIL', nombre: 'Ingeniero Solicitante 1' },
    { email: 'usuario2@zf.com', rol: 'Usuario General', area: 'Mantenimiento', nombre: 'Técnico Solicitante 2' },
    { email: 'usuario3@zf.com', rol: 'Usuario General', area: 'Ciberseguridad', nombre: 'Desarrollador Solicitante 3' },
    // Resto de roles
    { email: 'syr@zf.com', rol: 'S&R', area: 'Sistemas', nombre: 'Firma SyR' },
    { email: 'ehs@zf.com', rol: 'EHS', area: 'Mantenimiento', nombre: 'Firma EHS' },
    { email: 'seguridad@zf.com', rol: 'Seguridad', area: 'Sistemas', nombre: 'Guardia Caseta' },
    { email: 'auditor@zf.com', rol: 'Auditor', area: 'Ciberseguridad', nombre: 'El Auditor' }
  ];

  const usersMap = {};
  for (const u of usuariosTest) {
    const user = await prisma.usuarios.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombre_completo: u.nombre,
        email: u.email,
        password_hash: pass,
        id_rol: rolesMap[u.rol].id_rol,
        id_disciplina: areasMap[u.area].id_disciplina,
        activo: true
      }
    });
    // Guardamos el ID del usuario en el mapa usando su email como llave para no confundirlos
    usersMap[u.email] = user.id_usuario; 
  }

  // ==========================================
  // 4. REGLAS DE NEGOCIO
  // ==========================================
  await prisma.reglas_aprobacion.upsert({
    where: { id_categoria: catMap['Laptops'].id_categoria }, update: {},
    create: { id_categoria: catMap['Laptops'].id_categoria, requiere_gerente: true, requiere_syr: false, requiere_ehs: false }
  });
  await prisma.reglas_aprobacion.upsert({
    where: { id_categoria: catMap['Motores'].id_categoria }, update: {},
    create: { id_categoria: catMap['Motores'].id_categoria, requiere_gerente: true, requiere_syr: true, requiere_ehs: true }
  });

  // ==========================================
  // 5. EL ARSENAL DE ACTIVOS 
  // ==========================================
  console.log('4. Generando 10 activos con todos los campos financieros y aduanales...');

  // Estructura rica y realista basada en el Excel de ZF
  const activosData = [
    { nombre: 'MacBook Pro M3', serie: 'MAC-TEST-01', cat: 'Laptops', marca: 'Apple', modelo: 'Pro 14', ubi: 'Almacén Central ADAS', n_parte: 'PN-APL-001', tag: 'TAG-IT-0001', subarea: 'A001', desc: 'Laptop para desarrollo móvil', ped: '11 75 6912 0533224', fact: 'F-98922225', val: 45000.50, f_compra: '2024-01-15', es_compra: true, proy: 'Infraestructura IT', t_comp: 'Importación', t_nac: 'Definitiva' },
    { nombre: 'Dell Latitude 5420', serie: 'DELL-TEST-02', cat: 'Laptops', marca: 'Dell', modelo: 'Latitude', ubi: 'Almacén Central ADAS', n_parte: 'PN-DLL-002', tag: 'TAG-IT-0002', subarea: 'A001', desc: 'Equipo de soporte', ped: '11 75 6912 0533225', fact: 'F-98922226', val: 25000.00, f_compra: '2023-11-20', es_compra: true, proy: 'Infraestructura IT', t_comp: 'Nacional', t_nac: 'Propia' },
    { nombre: 'Motor Trifásico V8', serie: 'MOT-TEST-03', cat: 'Motores', marca: 'Siemens', modelo: 'Industrial V8', ubi: 'Laboratorio de Pruebas A', n_parte: 'PN-MOT-003', tag: 'MNR-ADAS-0003', subarea: 'Lab-A', desc: 'Motor para pruebas de torque', ped: '82 97 0648 8738796', fact: 'F-71046155', val: 125000.00, f_compra: '2024-03-10', es_compra: true, proy: 'Proyecto Validación SIL', t_comp: 'Importación', t_nac: 'Definitiva' },
    { nombre: 'Motor de Paso a Paso', serie: 'MOT-TEST-04', cat: 'Motores', marca: 'Bosch', modelo: 'Stepper M2', ubi: 'Laboratorio de Pruebas A', n_parte: 'PN-MOT-004', tag: 'MNR-ADAS-0004', subarea: 'Lab-A', desc: 'Motor de precisión', ped: '43 35 2547 3612365', fact: 'F-84163982', val: 18500.75, f_compra: '2024-02-05', es_compra: true, proy: 'Proyecto Pilot Gen2', t_comp: 'Importación', t_nac: 'Temporal' },
    { nombre: 'Sensor LiDAR VLP-16', serie: 'SENS-TEST-05', cat: 'Sensores', marca: 'Velodyne', modelo: 'VLP-16', ubi: 'Estante de Refacciones B2', n_parte: 'PN-SEN-005', tag: 'MNR-ADAS-0005', subarea: 'B002', desc: 'Sensor óptico de mapeo 3D', ped: '66 41 3007 7421584', fact: 'F-70098626', val: 85000.00, f_compra: '2023-08-12', es_compra: true, proy: 'Proyecto Pilot Gen2', t_comp: 'Importación', t_nac: 'Definitiva' },
    { nombre: 'Cámara Visión Artificial', serie: 'CAM-TEST-06', cat: 'Sensores', marca: 'Basler', modelo: 'Ace 2', ubi: 'Almacén Central ADAS', n_parte: 'PN-SEN-006', tag: 'MNR-ADAS-0006', subarea: 'B001', desc: 'Cámara para detección de objetos', ped: '64 10 6983 7836205', fact: 'F-18173634', val: 32000.20, f_compra: '2024-05-01', es_compra: true, proy: 'Proyecto Validación SIL', t_comp: 'Nacional', t_nac: 'Propia' },
    { nombre: 'Osciloscopio Digital 4CH', serie: 'OSC-TEST-07', cat: 'Osciloscopios', marca: 'Tektronix', modelo: 'TBS2000', ubi: 'Laboratorio de Pruebas A', n_parte: 'PN-OSC-007', tag: 'MNR-ADAS-0007', subarea: 'Lab-A', desc: 'Medición de señales CAN', ped: '11 75 6912 0533226', fact: 'F-98922227', val: 65000.00, f_compra: '2023-12-15', es_compra: true, proy: 'Mantenimiento General', t_comp: 'Importación', t_nac: 'Definitiva' },
    { nombre: 'Osciloscopio Portátil', serie: 'OSC-TEST-08', cat: 'Osciloscopios', marca: 'Fluke', modelo: '190 Series', ubi: 'Caseta de Seguridad', n_parte: 'PN-OSC-008', tag: 'MNR-ADAS-0008', subarea: 'Caseta', desc: 'Equipo de diagnóstico en campo', ped: null, fact: null, val: 42000.00, f_compra: '2021-06-20', es_compra: false, proy: 'Mantenimiento General', t_comp: 'Donación', t_nac: 'Propia' },
    // Refacciones con cantidades iniciales y actuales
    { nombre: 'Lote Cables Red', serie: 'REF-TEST-09', cat: 'Refacciones', marca: 'Panduit', modelo: 'Cat 6', ubi: 'Estante de Refacciones B2', n_parte: 'PN-REF-009', tag: 'MNR-ADAS-0009', subarea: 'B002', desc: 'Cables Ethernet de 3m', ped: null, fact: 'F-11111111', val: 5000.00, f_compra: '2024-01-10', es_compra: true, proy: 'Infraestructura IT', t_comp: 'Nacional', t_nac: 'Propia', cant: 150 },
    { nombre: 'Lote Tornillería Fina', serie: 'REF-TEST-10', cat: 'Refacciones', marca: 'Fastenal', modelo: 'M4x10', ubi: 'Estante de Refacciones B2', n_parte: 'PN-REF-010', tag: 'MNR-ADAS-0010', subarea: 'B002', desc: 'Tornillería para módulos HIL', ped: null, fact: 'F-22222222', val: 1200.00, f_compra: '2024-02-25', es_compra: true, proy: 'Mantenimiento General', t_comp: 'Nacional', t_nac: 'Propia', cant: 500 }
  ];

  for (const item of activosData) {
    await prisma.activos.upsert({
      where: { numero_serie: item.serie },
      update: {}, 
      create: {
        qr_codigo: crypto.randomUUID(),
        numero_serie: item.serie,
        marca: item.marca,
        modelo: item.modelo,
        anio: 2024,
        nombre_maquina: item.nombre,
        
        numero_parte: item.n_parte,
        tag: item.tag,
        subarea: item.subarea,
        descripcion: item.desc,
        pedimento: item.ped,
        factura: item.fact,
        valor_comercial: item.val,
        fecha_compra: item.f_compra ? new Date(item.f_compra) : null,
        es_compra: item.es_compra,
        cantidad_inicial: item.cant || null,
        cantidad_actual: item.cant || null,
        // -----------------------------------

        // Llaves foráneas obligatorias
        id_disciplina: areasMap['Validación HIL'].id_disciplina,
        id_categoria: catMap[item.cat].id_categoria,
        id_estado_maquina: estMap['Operativa'].id_estado_maquina, 
        id_ubicacion: ubiMap[item.ubi].id_ubicacion,
        id_gerente_responsable: usersMap['gerente@zf.com'], // El gerente es dueño para facilitar pruebas

        // Llaves foráneas opcionales 
        id_proyecto: proyMap[item.proy].id_proyecto,
        id_tipo_compra: tCompraMap[item.t_comp].id_tipo_compra,
        id_tipo_nacionalidad: tNacMap[item.t_nac].id_tipo_nacionalidad
      }
    });
  }

  console.log('siembra Exhaustiva finalizada con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });