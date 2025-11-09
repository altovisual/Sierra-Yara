import React from 'react';
import { Card, Skeleton } from 'antd';

/**
 * Skeleton loader para tarjetas de productos
 */
export const ProductCardSkeleton = () => (
  <Card
    style={{
      borderRadius: '16px',
      overflow: 'hidden',
      height: '100%'
    }}
  >
    <Skeleton.Image
      active
      style={{
        width: '100%',
        height: '200px',
        borderRadius: '12px'
      }}
    />
    <div style={{ padding: '16px 0' }}>
      <Skeleton active paragraph={{ rows: 2 }} />
    </div>
  </Card>
);

/**
 * Skeleton loader para lista de pedidos
 */
export const PedidoSkeleton = () => (
  <Card
    style={{
      marginBottom: '16px',
      borderRadius: '12px'
    }}
  >
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Skeleton.Avatar active size={64} shape="square" />
      <div style={{ flex: 1 }}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    </div>
  </Card>
);

/**
 * Skeleton loader para estadísticas del dashboard
 */
export const StatCardSkeleton = () => (
  <Card
    style={{
      borderRadius: '12px',
      height: '100%'
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <Skeleton.Avatar active size={56} style={{ marginBottom: '16px' }} />
      <Skeleton active paragraph={{ rows: 1 }} />
    </div>
  </Card>
);

/**
 * Skeleton loader para tabla
 */
export const TableSkeleton = ({ rows = 5 }) => (
  <div>
    {[...Array(rows)].map((_, index) => (
      <Card
        key={index}
        style={{
          marginBottom: '8px',
          borderRadius: '8px'
        }}
      >
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    ))}
  </div>
);

/**
 * Skeleton loader para el menú de productos (grid)
 */
export const MenuGridSkeleton = ({ count = 6 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    padding: '24px 0'
  }}>
    {[...Array(count)].map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton loader para detalles de pedido
 */
export const PedidoDetailSkeleton = () => (
  <div style={{ padding: '16px 0' }}>
    <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
    <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
      <Skeleton active paragraph={{ rows: 4 }} />
    </Card>
    <Card style={{ borderRadius: '8px' }}>
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  </div>
);

const SkeletonLoaders = {
  ProductCardSkeleton,
  PedidoSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  MenuGridSkeleton,
  PedidoDetailSkeleton
};

export default SkeletonLoaders;
