import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge, PriorityBadge } from './StatusBadge';

describe('StatusBadge Component', () => {
  it('renders Pendente status correctly', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('renders Resolvida status correctly', () => {
    render(<StatusBadge status="RESOLVED" />);
    expect(screen.getByText('Resolvida')).toBeInTheDocument();
  });

  it('renders Em Atendimento status correctly', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('Em Atendimento')).toBeInTheDocument();
  });
});

describe('PriorityBadge Component', () => {
  it('renders Urgente priority correctly', () => {
    render(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText('Urgente')).toBeInTheDocument();
  });

  it('renders Média priority correctly', () => {
    render(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('Média')).toBeInTheDocument();
  });
});
