import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { swalFire } = vi.hoisted(() => ({ swalFire: vi.fn() }));
// SweetAlert2 no funciona en jsdom: se verifica con que se invoca.
vi.mock('sweetalert2', () => ({ default: { fire: swalFire } }));

import { PetFormModal } from './PetFormModal';
import { Sexo, type Pet } from '../types/pet.types';

const foto = (name = 'max.png', type = 'image/png') => new File(['x'], name, { type });
const subirFoto = (user: ReturnType<typeof userEvent.setup>, file: File) =>
  user.upload(screen.getByLabelText('Foto de la mascota'), file);

const llenarDatos = async (user: ReturnType<typeof userEvent.setup>, peso = '12.5') => {
  await user.type(screen.getByPlaceholderText('Ej: Max, Luna...'), 'Max');
  await user.selectOptions(screen.getAllByRole('combobox')[0], 'Perro');
  const pesoInput = screen.getByRole('spinbutton');
  await user.clear(pesoInput);
  if (peso) await user.type(pesoInput, peso);
};

const mascota: Pet = {
  id: 7,
  nombre: 'Luna',
  especie: 'Gato',
  raza: 'Siamés',
  sexo: Sexo.HEMBRA,
  fechaNacimiento: '2022-01-10',
  pesoKg: 4,
  fotoUrl: 'https://res.cloudinary.com/demo/luna.jpg',
  esterilizado: true,
  observacionesMedicas: null,
  createdAt: '2026-01-01T00:00:00',
};

describe('PetFormModal: registro de mascota', () => {
  beforeEach(() => {
    swalFire.mockReset();
  });

  it('sin foto no registra y lo dice junto al campo', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PetFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    await llenarDatos(user);
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sube una foto de tu mascota');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sin peso avisa en el campo en vez de no hacer nada', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PetFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    await subirFoto(user, foto());
    await llenarDatos(user, '');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(await screen.findByText('Ingresa el peso de tu mascota')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('con el peso inicial en 0 tambien avisa', async () => {
    const user = userEvent.setup();
    render(<PetFormModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} />);

    await subirFoto(user, foto());
    await user.type(screen.getByPlaceholderText('Ej: Max, Luna...'), 'Max');
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'Perro');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(await screen.findByText('El peso debe ser mayor a 0')).toBeInTheDocument();
  });

  it('rechaza un formato que el backend no acepta y no lo envia', async () => {
    // user-event descarta en silencio lo que el atributo accept no permite; aqui se
    // prueba justamente que pasa si ese archivo llega igual (arrastrar, navegador viejo).
    const user = userEvent.setup({ applyAccept: false });
    const onSubmit = vi.fn();
    render(<PetFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    await subirFoto(user, foto('max.heic', 'image/heic'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Formato no permitido/);

    await llenarDatos(user);
    await user.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('con foto y datos completos envia la mascota', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PetFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    const file = foto();
    await subirFoto(user, file);
    await llenarDatos(user);
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [datos, enviada] = onSubmit.mock.calls[0];
    expect(datos).toMatchObject({ nombre: 'Max', especie: 'Perro', pesoKg: 12.5, sexo: null });
    expect(enviada).toBe(file);
  });

  it('elegir sexo y volver a "Seleccionar..." no bloquea el registro', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PetFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    await subirFoto(user, foto());
    await llenarDatos(user);
    const sexo = screen.getAllByRole('combobox')[1];
    await user.selectOptions(sexo, Sexo.MACHO);
    await user.selectOptions(sexo, '');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].sexo).toBeNull();
  });

  it('la foto elegida para una mascota no se arrastra a la siguiente que se edita', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(<PetFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    await subirFoto(user, foto());
    rerender(<PetFormModal isOpen={false} onClose={vi.fn()} onSubmit={onSubmit} />);
    rerender(<PetFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} pet={mascota} />);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][1]).toBeUndefined();
  });
});
