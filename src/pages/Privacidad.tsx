export const Privacidad = () => {
    return (
        <div className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full bg-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-8 text-[#0d131b] border-b pb-4">Política de Privacidad</h1>
            <div className="prose max-w-none text-slate-600 space-y-6">
                <p>
                    La presente Política de Privacidad describe de manera detallada cómo se recopilan, utilizan, almacenan y protegen los datos personales de los usuarios (compradores y vendedores) en la plataforma HUELLA 360.
                </p>
                <p>
                    Toda la información recolectada es tratada en estricto cumplimiento de la Ley de Protección de Datos Personales del Perú (Ley N° 29733) y su Reglamento. El titular de la plataforma y responsable del tratamiento de los datos es la empresa <strong>SUPERINKA.COM E.I.R.L.</strong>, identificada con RUC N° 20606677074, con domicilio en Calle Ramón Zavala 790, Urb Las Moreras, distrito de La Perla, provincia Callao y departamento de Callao, Perú.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">BANCOS DE DATOS REGISTRADOS</h2>
                <p>Los datos personales recabados a través de la plataforma serán almacenados de forma segura en los bancos de datos de titularidad de la Empresa, los cuales se encuentran debidamente inscritos ante el Registro Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos de la República del Perú:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Banco de Datos "Usuarios y Compradores":</strong> [Código de Registro N° XXXXX].</li>
                    <li><strong>Banco de Datos "Vendedores y Comercios":</strong> [Código de Registro N° XXXXX].</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">DATOS PERSONALES QUE RECOPILAMOS</h2>
                <p>Para el correcto uso de las funciones de la plataforma, recolectamos la siguiente información según el perfil del usuario:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Datos del Comprador/Cliente:</strong> Nombres y apellidos, DNI o Carné de Extranjería, correo electrónico, celular, dirección de entrega (delivery) y datos de su mascota (nombre, especie, raza y edad).</li>
                    <li><strong>Datos del Vendedor/Comercio:</strong> Nombre comercial, razón social, número de RUC, dirección física, nombres y apellidos del representante legal, número de colegiatura del Médico Veterinario (CMVP) y datos de la cuenta bancaria.</li>
                    <li><strong>Datos de Navegación:</strong> Dirección IP, identificadores de cookies, tipo de navegador y comportamiento de uso dentro del Sitio.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">FINALIDADES NECESARIAS PARA EL TRATAMIENTO</h2>
                <p>La Empresa procesará los datos personales únicamente para las siguientes finalidades esenciales vinculadas al marketplace:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Gestionar la creación, mantenimiento y validación de cuentas.</li>
                    <li>Facilitar la intermediación comercial entre compradores y vendedores para la venta o agendamiento de citas.</li>
                    <li>Procesar y recaudar pagos a través de pasarelas.</li>
                    <li>Enviar notificaciones del estado de pedidos, citas y alertas.</li>
                    <li>Atender reclamos presentados en el Libro de Reclamaciones Virtual.</li>
                    <li>Prevenir fraudes, suplantaciones de identidad y asegurar la integridad tecnológica.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">FINALIDADES OPCIONALES</h2>
                <p>Solo si el usuario lo autoriza expresamente (opt-in), la Empresa podrá utilizar sus datos para:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Enviar promociones, boletines informativos, descuentos y ofertas de productos o servicios.</li>
                    <li>Realizar encuestas de satisfacción y estudios de mercado.</li>
                </ul>
                <p className="text-sm italic">Nota: La negativa a autorizar estas finalidades opcionales no impedirá el uso básico de la plataforma ni la realización de compras.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">PLAZO DE CONSERVACIÓN DE LOS DATOS</h2>
                <p>
                    Los datos personales se conservarán mientras se mantenga vigente la cuenta del usuario o la relación comercial con la Empresa. Tras la cancelación o baja de la cuenta, los datos serán conservados debidamente bloqueados durante un plazo máximo de diez (10) años, con la única finalidad de atender posibles responsabilidades legales, tributarias o requerimientos de autoridades competentes, procediéndose posteriormente a su supresión o anonimización definitiva.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">TRANSFERENCIA DE DATOS PERSONALES (DESTINATARIOS)</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Al Vendedor / Comercio Aliado:</strong> Se transferirán datos de contacto y entrega del Comprador para realizar el despacho o atender la cita.</li>
                    <li><strong>A las Pasarelas de Pago:</strong> Proveedores tecnológicos para el procesamiento seguro de cobros.</li>
                    <li><strong>A empresas de mensajería o hosting:</strong> Proveedores de servidores y envío de correos electrónicos.</li>
                </ul>
                <p>La Empresa garantiza que sus proveedores cumplen con los estándares de seguridad exigidos por ley.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">TRANSFERENCIA INTERNACIONAL DE DATOS (FLUJO TRANSFRONTERA)</h2>
                <p>
                    El usuario toma conocimiento y otorga su consentimiento de que los servidores que alojan la plataforma pertenecen a proveedores en la nube (AWS, Google Cloud, etc.) cuyas infraestructuras pueden estar ubicadas fuera del territorio peruano.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">AUDITORÍA DE MENSAJERÍA INTERNA Y CONFIDENCIALIDAD</h2>
                <p>
                    En concordancia con los Términos y Condiciones, el usuario toma conocimiento de que la Empresa podrá emplear herramientas tecnológicas y filtros automatizados para el monitoreo de la mensajería interna. Dicho procesamiento automatizado tiene la única finalidad de detectar intentos de evasión de comisiones (desvío de pagos fuera del sistema), prevenir fraudes y reportar conductas que atenten contra la seguridad o bienestar animal. La Empresa garantiza que este procedimiento respeta la confidencialidad de las consultas clínicas o médicas veterinarias realizadas entre el Cliente y el Vendedor.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">MEDIDAS DE SEGURIDAD IMPLEMENTADAS</h2>
                <p>
                    Se han implementado medidas de seguridad técnicas y organizativas para evitar la pérdida, alteración, mal uso o acceso no autorizado a los datos, incluyendo cifrado de datos, certificados SSL y control de acceso restringido.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">EJERCICIO DE DERECHOS ARCO</h2>
                <p>De conformidad con la normativa peruana, los usuarios tienen derecho a ejercer gratuitamente sus derechos de Acceso, Rectificación, Cancelación u Oposición (ARCO).</p>
                <p>
                    Para ejercer estos derechos, el usuario deberá remitir una solicitud formal dirigida al correo electrónico oficial [correo@huella360.com], adjuntando copia legible de su DNI o documento de identidad, e indicando el derecho específico que desea ejercer.
                </p>
                <p>La Empresa atenderá la solicitud dentro de los plazos legales establecidos en el Reglamento de la Ley N° 29733:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Respuesta a Solicitudes de Acceso:</strong> Máximo de veinte (20) días hábiles contados desde el día siguiente de presentada la solicitud.</li>
                    <li><strong>Respuesta a Solicitudes de Rectificación, Cancelación u Oposición:</strong> Máximo de diez (10) días hábiles contados desde el día siguiente de presentada la solicitud.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0d131b]">MODIFICACIONES A LA POLÍTICA DE PRIVACIDAD</h2>
                <p>
                    La Empresa se reserva el derecho de modificar esta política. Cambios significativos serán notificados mediante aviso destacado en la plataforma o vía correo electrónico.
                </p>
            </div>
        </div>
    );
};
