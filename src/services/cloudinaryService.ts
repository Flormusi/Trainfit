import { Cloudinary } from '@cloudinary/url-gen';
import { auto, fit } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';

// Configuración de Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'demo'
  }
});

// Función para generar URL optimizada de imagen
export const getOptimizedImageUrl = (publicId: string, width = 300, height = 200): string => {
  if (!publicId) {
    return '/images/exercises/placeholder.svg';
  }

  try {
    const image = cld.image(publicId)
      .resize(fit().width(width).height(height))
      .delivery(format('auto'))
      .delivery(quality('auto'));
    
    return image.toURL();
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    return '/images/exercises/placeholder.svg';
  }
};

// Función para subir imagen a Cloudinary (para uso futuro)
export const uploadImage = async (file: File, folder = 'exercises'): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${(import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.public_id;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Mapeo de nombres de ejercicios a public_ids de Cloudinary
// Esto se puede mover a una base de datos en el futuro
export const exerciseImageMap: Record<string, string> = {
  // Bíceps
  'Biceps en banco scott': 'Biceps_en_banco_scott_rwokdv',
  'Curl bíceps alterno tipo martillo': 'Curl_bíceps_alterno_tipo_martillo_typztg',
  'Curl de bíceps con polea': 'Curl_de_bíceps_con_polea_t9rly3',
  'Curl de bíceps con barra': 'Curl_de_bíceps_con_barra_l6dumd',
  'Biceps sentado': 'Biceps_sentado_wx7e6n',
  'Biceps con mancuernas': 'Biceps_con_mancuernas_dxghjv',
  'Biceps mas sentadillas': 'Biceps_mas_sentadillas_dhwjoe',
  'Biceps + press de hombros': 'Biceps_press_de_hombros_dcikkk',
  
  
  // Tríceps
  'Fondos paralelas': 'Fondos_paralelas_zjknbj',
  'Extensiones de tríceps en polea alta con cuerda': 'Extensiones_de_tríceps_en_polea_alta_con_cuerda_fgorga',
  'Press francés en banco plano': 'Press_francés_en_banco_plano_vce2pe',
  'Press francés en banco plano con mancuernas': 'Press_francés_en_banco_plano_con_mancuernas_t80qgg',
  'Extensión vertical de codos con mancuerna': 'Extensión_vertical_de_codos_con_mancuerna_ps7tkz',
  'Flexion triceps corazón': 'Flexion_triceps_corazón_jcqtdz',
  'Fondos de triceps': 'Fondos_de_triceps_hhscbo',
  
  // Piernas
  'Sentadillas + press': 'Sentadillas_press_fqwkbp',
  'Subida al banco + press': 'Subida_al_banco_press_yb3iso',
  'Control pelvico + Press de pecho': 'Control_pelvico_Press_de_pecho_b6wf92',
  'Sentadilla isométrica': 'Sentadilla_isométrica_v9dxhj',
  'Estocada atrás con elevación y banda': 'Estocada_atrás_con_elevación_y_banda_z8mfyh',
  'Estocada atrás con déficit': 'Estocada_atrás_con_déficit_ztp4qb',
  'Sentadillas Copa': 'Sentadillas_Copa_pshhjp',
  'Sentadilla Búlgara': 'Sentadilla_Búlgara_jamqwb',
  'Subidas al cajon': 'Subidas_al_cajon_lgp4na',
  'Subidas al cajon de costado': 'Subidas_al_cajon_de_costado_mv0siv',
  'Pistols al banco': 'Pistols_al_banco_ilpngj',
  'Sentadillas con barra': 'Sentadillas_con_barra_ahjld7',
  'Prensa 45': 'Prensa_45_knhaq1',
  'Sillón de cuadriceps': 'Sillón_de_cuadriceps_sl65j2',
  'Abductores en máquina': 'Abductores_en_máquina_wbvd0r',
  'Estocada lateral': 'Estocada_lateral_vdzvvi',
  'Vitalización lateral': 'Vitalización_lateral_avc7iu',
  'Control Pelvico Unilateral': 'Control_Pelvico_Unilateral_ds8vua',
  'Estocadas cruzadas por detrás': 'Estocadas_cruzadas_por_detrás_xmafqs',
  'Vitalización': 'Vitalización_n5pavq',
  'Caminata Lateral Banda Muslo': 'Caminata_Lateral_Banda_Muslo_jihipy',
  'Prensa horizontal': 'Prensa_horizontal_ig5ag9',
  'Peso muerto sumo': 'Peso_muerto_sumo_wkvn9n',
  'Sentadilla sumo con mancuerna': 'Sentadilla_sumo_con_mancuerna_c0rbmm',
  'Sentadilla sumo con barra': 'Sentadilla_sumo_con_barra_bt7l5f',
  'Aductor en maquina': 'Aductor_en_maquina_zuph8l',
  'Skaters': 'Skaters_tq3btf',
  'Abductor en polea': 'Abductor_en_polea_woaprn',
  'Aductor en polea': 'Aductor_en_polea_aumvko',
  'Estocada atrás con mancuerna': 'Estocada_atrás_con_mancuerna_lo0f0d',
  'Estocadas caminadas': 'Estocadas_caminadas_h6epkt',

  // Glúteos
  'Control Pelvico': 'Control_Pelvico_cum1xf',
  'Control pélvico con mancuerna': 'Control_Pelvico_con_mancuerna_r4fger',
  'Puente de glúteo rodilla cruzada': 'Puente_de_glúteo_rodilla_cruzada_oi6qjm',
  'Patada de Perrito': 'Patada_de_Perrito_uactiq',
  'Swing Ketbell': 'Swing_Ketbell_tgwey7',
  'Patada de glúteo 4 apoyos tobillera': 'Patada_de_glúteo_4_apoyos_tobillera_g77qeq',
  'Patada Gluteo polea pierna recta': 'Patada_Gluteo_polea_pierna_recta_y8tgcc',
  'Abductores en polea': 'Abductores_en_polea_vd3fcu',
  'Pull Through': 'Pull_Through_cbumlv',
  'Hip thrust a 1 pierna': 'Hip_thrust_a_1_pierna_u0mzdg',
  'Hip Thrust con Barra': 'Hip_Thrust_con_Barra_mspzfl',
  'Puente de Glúteos Rana': 'Puente_de_Glúteos_Rana_sccgh9',
  'Hip thrust con mancuerna': 'Hip_thrust_con_mancuerna_tjtajf',
  'Abducción de cadera con disco de pie': 'Abducción_de_cadera_con_disco_de_pie_ixbhca',

  // Isquios
  'Peso muerto con barra': 'Peso_muerto_con_barra_vuuoxv',
  'Peso muerto estilo sumo': 'Peso_muerto_estilo_sumo_zqs5b8',
  'Peso Muerto a 1 Pierna': 'Peso_Muerto_a_1_Pierna_heuso4',
  'Isquios en camilla': 'Isquios_en_camilla_ohdxuw',
  'Isquios camilla 1 pierna': 'Isquios_camilla_1_pierna_larv2v',
  'Peso Muerto con mancuernas': 'Peso_Muerto_con_mancuernas_scdi9o',
  'Isquios con Hamroll': 'Isquios_con_Hamroll_w4awwy',
  'Control pelvico con talones': 'Control_pelvico_con_talones_rbmh8n',

  // Dorsales
  'Remo con barra invertido': 'Remo_con_barra_invertido_tp17oc',
  'Dominadas en barra fija': 'Dominadas_en_barra_fija_nioao6',
  'Dominadas en barra fija, agarre en supinación': 'Dominadas_en_barra_fija_agarre_en_supinación_tn3o3s',
  'Dorsal al frente en polea': 'Dorsal_al_frente_en_polea_oejpon',
  'Polea al pecho agarre estrecho': 'Polea_al_pecho_agarre_estrecho_yvs5au',
  'Remo sentado': 'Remo_sentado_bfgfvf',
  'Remo con mancuernas s/ banco inclinado': 'Remo_con_mancuernas_s__banco_inclinado_eb0rim',
  'Remo a un brazo': 'Remo_a_un_brazo_izmkjf',
  'Remos con barra': 'Remos_con_barra_kgswja',
  'Pull over con mancuerna': 'Pull_over_con_mancuerna_btarzd',
  'Gorilla row': 'Gorilla_row_tgrjct',

  // Pectorales
  'Press de banca plano': 'Press_de_banca_plano_ukvqzd',
  'Press de banca inclinado': 'Press_de_banca_inclinado_s2v9gi',
  'Press de banca declinado': 'Press_de_banca_declinado_jeqyii',
  'Flexiones de brazos en el suelo': 'Flexiones_de_brazos_en_el_suelo_kgxfct',
  'Press mancuernas banco plano': 'Press_mancuernas_banco_plano_nrl1nb',
  'Aperturas mancuernas banco plano': 'Aperturas_mancuernas_banco_plano_jysgao',
  'Press mancuernas banco inclinado': 'Press_mancuernas_banco_inclinado_ght4mg',
  'Aperturas en peck deck': 'Aperturas_en_peck_deck_vpwrgd',
  'Pull-over con mancuerna': 'Pull-over_con_mancuerna_uytfjz',
  'Press de Pecho en maquina': 'Press_de_Pecho_en_maquina_kn9ald',
  'Press a 1 brazo 45': 'Press_a_1_brazo_45_xtsimu',
  'Press a 1 brazo plano': 'Press_a_1_brazo_plano_w5a81h',
  'Press de pecho + control pelvico': 'Press_de_pecho_control_pelvico_hhevuv',
  'Flexiones de brazos con pies elevados': 'Flexiones_de_brazos_con_pies_elevados_jsvnn5',

  // Gemelos
  'Gemelos de Pie': 'Gemelos_de_Pie_ckbel0',
  'Gemelos (soleo)en Maquina sentado': 'Gemelos_soleo_en_Maquina_sentado_iopmr9',
  
  // Cardio
  'Elíptico': 'Elíptico_ovk3gk',
  'Cinta': 'Cinta_h9xqcz',
  'Bici': 'Bici_x9wyw0',
  'Jumping Jacks': 'Jumping_Jacks_kgxrwl',
  'Soga': 'Soga_heyxy0',
  'Seal Jack': 'Seal_Jack_vxver2',
  'Saltos estrella': 'Saltos_estrella_lp4hw0',
  'Burpee Completo': 'Burpee_Completo_c2nha3',
  'Repiqueteo': 'Repiqueteo_ufhdtp',
  'Talones a la cola': 'Talones_a_la_cola_do4aa9',
  'Saltos Split': 'Saltos_Split_bmdmps',
  'Skier Jack': 'Skier_Jack_y62dbv',
  
  // Espinales
  'Espinal cruzado': 'Espinal_cruzado_zch4ku',
  'Espinal Nado': 'Espinal_Nado_ba8urm',
  'Bird Dog': 'Bird_Dog_w3l6k9',
  'Espinal Superman': 'Espinal_Superman_kakkyx',
  'Espinal caprichito': 'Espinal_caprichito_vfjnyh',
  'Espinal paracaída': 'Espinal_paracaída_jdxnun',
  'Extensión lumbar acostado': 'Extensión_lumbar_acostado_tzcf1z',
  'Saludo al sol dinámico': 'Saludo_al_sol_dinamico_p1mmye',
  
  // Core
  'Abdominal bolita': 'Abdominal_bolita_bvelqd',
  'Activación suelo pélvico con pelota': 'Activación_suelo_pélvico_con_pelota_con_pelota_wym5wo',
  'Abs banco declinado con rotación': 'Abs_banco_declinado_con_rotación_jfpvme',
  'Abs en banco declinado': 'Abs_en_banco_declinado_gkuwma',
  'Abs con apoyo de pies en banco': 'Abs_con_apoyo_de_pies_en_banco_bgivkc',
  'Abdominales cortitos con peso': 'Abdominales_cortitos_con_peso_tmvurd',
  'Escaladores': 'Escaladores_lft6ug',
  'Estocada atrás con giro': 'Estocada_atrás_con_giro_g0gbyo',
  'Plancha baja + abro piernas': 'Plancha_baja_abro_piernas_rmpyn0',
  'Plancha alta flexión de rodillas': 'plancha_alta_flexión_de_rodillas_fpifpq',
  'Elevación de piernas colgado': 'Elevación_de_piernas_colgado_xpo5eh',
  'Plancha lateral arrodillado': 'Plancha_lateral_arrodillado_fozywa',
  'Retroversión-Anteversión': 'Retroversión-Anteversión_z6gend',
  'Rodillas al pecho fitball': 'Rodillas_al_pecho_fitball_fx8wy1',
  'Plancha baja': 'Plancha_baja_fe82xz',
  'Plancha alta': 'Plancha_alta_hcrtzh',
  'Plancha lateral': 'Plancha_lateral_xlup7o',
  'Plancha declinada': 'Plancha_declinada_wlbmgi',
  'Plancha alta estiro brazo': 'Plancha_alta_estiro_brazo_ir1qod',
  'Bird dog': 'Bird_dog_ghzcok',
  'Dead bug': 'Dead_bug_okxzpp',
  'Dead bug contralateral': 'Dead_bug_contralateral_lvvahk',
  'Plancha baja-alta': 'Plancha_baja-alta_csadas',
  'Plancha alta con remo': 'Plancha_alta_con_remo_moidr8',
  'Plancha lateral + flexión rodilla': 'Plancha_lateral_flexión_rodilla_z513kb',
  'Plancha en banco toco lumbar': 'Plancha_en_banco_toco_lumbar_cnquaa',
  'Plancha inversa': 'Plancha_inversa_jw2p29',
  'Plancha inversa estiro pierna': 'Plancha_inversa_estiro_pierna_yqxd13',
  'Desplazamiento plancha en fitball': 'Desplazamiento_plancha_en_fitball_luuwi5',
  'Roll out con fit ball':'Roll_out_con_fitball_jyepcs',
  'Press pallof': 'Press_pallof_hxu26p',
  'Rueda abdominal': 'Rueda_abdominal_ncudna',
  'Elevación de rodilla colgado': 'Elevación_de_rodilla_colgado_ef7tic',
  'Plancha Jack': 'Plancha_Jack_e9h31x',
  'Twist': 'Twist_gt88t1',
  'Abs en banco 90°': 'Abs_en_banco_90_gffrid',
  'Rotaciones con landmine': 'Rotaciones_con_landmine_vjepdn',
  'Halo': 'Halo_ieknjz',
  'Oblicuos con mancuerna de pie': 'Oblicuos_con_mancuerna_de_pie_uuw5ag',
  'Plancha talón al glúteo': 'Plancha_talón_al_glúteo_1_fr5vnn',
  'Dead bug con disco pp juntas': 'Dead_bug_con_disco_pp_juntas_rjxmn0',
  'Dead bug con disco a una pierna': 'Dead_bug_con_disco_a_una_pierna_mq8rrg',
  'V ups alternados': 'V_ups_alternados_qous9c',
  'V ups': 'V_ups_qdwlgw',
  'Pies a la barra': 'Pies_a_la_barra_phi8m3',
  'Abdominal inferior colgado en sillón': 'Abdominal_inferior_colgado_en_sillón_cabegh',
  'Hollow': 'Hollow_hpt7am',
  'Abdominales oblicuos cruzados': 'Abdominales_oblicuos_cruzados_oahdre',
  'Abs a piernas extendidas': 'Abdominales_a_piernas_extendidas_lijpxc',
  'Elevaciones inferiores': 'Elevaciones_inferiores_pd3eqd',
  'Dead Bug con Banda': 'Dead_Bug_con_Banda_u19qhf',
  'Abdominales en banco': 'Abdominales_en_banco_ipquxw',
  'Abdominales Sit Up': 'Abdominales_Sit_Up_eggyhp',
  'Abdominales bicicleta': 'Abdominales_bicicleta_x2dkxu',
  'Abdominales tijera': 'Abdominales_tijera_aausup',
  'Plancha alta toco hombros': 'Plancha_alta_toco_hombros_lnfseb',
  'Abdominales inferiores rodillas flexionadas': 'Abdominales_inferiores_rodillas_flexionadas_iulrpz',
  'Abdominales Inferiores a piernas extendidas': 'Abdominales_Inferiores_a_piernas_extendidas_afttov',
  'Jack sit ups': 'Jack_sit-ups_xsjbaq',
  'Giros de Rodillas': 'Giros_de_Rodillas_b0v8vh',
  'Elevación diagonal': 'Elevación_diagonal_m8pw8m',
  'Abdominales con pelota': 'Abdominales_con_pelota_izilof',
  'Rodillas al pecho TRX': 'Rodillas_al_pecho_TRX_emyqa8',
  'Plancha lateral en banco': 'Plancha_lateral_en_banco_bci7gv',
  'Plancha lateral con torsión TRX': 'Plancha_lateral_con_torsión_TRX_thtyeb',
  'Plancha en fitball + elev. piernas': 'Plancha_en_fitball_elev._piernas_rgilel',
  'Plancha en step der.-izq.': 'Plancha_en_step_der.-izq._n7q1my',
  'Plancha en balón un brazo': 'Plancha_en_balón_un_brazo_pvx7yv',
  'Plancha baja dinámica TRX': 'Plancha_baja_dinámica_TRX_oychow',
  'Plancha baja bosú + elev. pierna': 'Plancha_baja_bosú_elev._pierna_k5plh2',
  'Plancha baja arrodillado': 'Plancha_baja_arrodillado_gjxjhn',
  'Plancha baja + tríceps': 'Plancha_baja_tríceps_nrroji',
  'Plancha alta banda en muñecas': 'Plancha_alta_banda_en_muñecas_fw4xkt',
  'Pase carga lateral': 'Pase_carga_lateral_zflkkx',
  'Oblicuos en silla romana (pie adelante)': 'Oblicuos_en_silla_romana_pie_adelante_kw7sek',

  // Glúteos (ejercicios adicionales - estos paths necesitan verificación)
  // 'Sentadilla': 'trainfit/gluteos/sentadilla', // Verificar si existe
  // 'Hip thrust': 'trainfit/gluteos/hip_thrust', // Verificar si existe
  // 'Peso muerto': 'trainfit/gluteos/peso_muerto', // Verificar si existe
  
  // Hombros
  'Rotación externa con banda unilateral': 'Rotación_externa_con_banda_unilateral_sjpvlz',
  'Vuelos laterales de pie con mancuernas': 'Vuelos_laterales_de_pie_con_mancuernas_oiqjnw',
  'Vuelos Frontales': 'Vuelos_Frontales_vwqeix',
  'Press de hombros unilateral': 'Press_de_hombros_unilateral_vv8rod',
  'Thruster': 'Thruster_hfcttu',
  'Press Militar': 'Press_Militar_nhjfsw',
  'Press de Hombros de Pie con mancuernas': 'Press_de_Hombros_de_Pie_con_mancuernas_tux27v',
  'Face Pull': 'Face_Pull_yaymsh',
  
  // Piernas (ejercicios adicionales - estos paths necesitan verificación)
  // 'Sentadilla búlgara': 'trainfit/piernas/sentadilla_bulgara', // Verificar si existe
  // 'Extensión de cuádriceps': 'trainfit/piernas/extension_cuadriceps', // Verificar si existe
  // 'Curl de isquios': 'trainfit/piernas/curl_isquios', // Verificar si existe
  
  // Potencia
  'Arranque a 1 Brazo': 'Arranque_a_1_Brazo_zwmxcg',
  'Adentro Afuera': 'Adentro_Afuera_imv7wr',
  'Saltos lado a lado': 'Saltos_lado_a_lado_ihkoqn',
  'Saltos adelante': 'Saltos_adelante_akdebp',
  'Salto con soga': 'Salto_con_soga_o1wfq7',
  'Sentadilla con Salto': 'Sentadilla_con_Salto_brlrc6',
  'Salto al Cajon': 'Salto_al_Cajon_tim5ea',
  'Repiqueteo con banda': 'Repiqueteo_con_banda_huvrew',
  'Estocada bulgara explosiva': 'Estocada_bulgara_explosiva_fq1agc',
  
  // Circuito
  'Tabata 20x10': 'Tabata_20x10_be9ore',
  'Intermitente 30x15': 'Intermitente_30x15_chytbw',
  'Intermitente 30x30': 'Intermitente_30x30_bezbty',
  'intermitente 1\'x2\'': 'intermitente_1_x2__xbowkf',
  'Intermitente 2x1': 'Intermitente_2x1_qsmjxa',
  'Aerobico continuo': 'Aerobico_continuo_jllu4q',
  'Cardio 3 minutos': 'Cardio_3_minutos_ywywru',
  'Intermitente 45x15': 'Intermitente_45x15_hlvet7',
  'Pasadas 100': 'Pasadas_100_wuolnq',
  'Pasadas 400': 'Pasadas_400_om6sy9',
  'Pasadas 200': 'Pasadas_200_n1wrlu',
  'Pasadas 50': 'Pasadas_50_kcgwf2',
  
  // Movilidad
  'Liberación pelvica': 'Liberación_pelvica_oahk9s',
  'Flexión-extensión rodilla': 'Flexión-extensión_rodilla_aehqkk',
  'Movilidad piramidal/gluteo': 'Movilidad_piramidal_gluteo_kr1c3n',
  'Estiramiento cuadriceps psoas': 'Estiramiento_cuadriceps_psoas_a1e0t4',
  'Apertura lateral acostado': 'Apertura_lateral_acostado_kxw3oh',
  'Apertura toracica': 'Apertura_toracica_diwyby',
  'Gato contento-enojado': 'Gato_contento-enojado_zhmy79',
  'Estiramiento Cervical': 'Estiramiento_Cervical_ml7tpu',
  'Apertura toracica de rodillas': 'Apertura_toracica_de_rodillas_ilddnp',
  'Estiramiento isquios en banco': 'Estiramiento_isquios_en_banco_d4xiww',
  'Escorpiones': 'Escorpiones_bghw6l'
};

// Función para obtener la URL de imagen de un ejercicio
export const getExerciseImageUrl = (exerciseName: string, width = 300, height = 200): string => {
  const publicId = exerciseImageMap[exerciseName];
  
  if (publicId) {
    return getOptimizedImageUrl(publicId, width, height);
  }
  
  // Fallback a placeholder
  return '/images/exercises/placeholder.svg';
};