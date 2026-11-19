import { useState } from 'react';
import { useStore } from './store';

// Controla o modal de adicionar/editar e aplica o resultado no store.
export function useEditor() {
  const { add, update, remove } = useStore();
  const [state, setState] = useState({ visible: false, item: null, mes: 1 });

  const novo = (mes = 1) => setState({ visible: true, item: null, mes });
  const editar = (item) => setState({ visible: true, item, mes: item.mes });
  const fechar = () => setState((s) => ({ ...s, visible: false }));

  const salvar = (data, { repetirAteDezembro } = {}) => {
    if (state.item) {
      update(state.item.id, data);
    } else if (repetirAteDezembro) {
      for (let m = data.mes; m <= 12; m++) add({ ...data, mes: m, status: m === data.mes ? data.status : 'A pagar', dataPagamento: m === data.mes ? data.dataPagamento : null });
    } else {
      add(data);
    }
    fechar();
  };
  const excluir = (id) => {
    remove(id);
    fechar();
  };

  return {
    novo, editar,
    formProps: { visible: state.visible, item: state.item, mesInicial: state.mes, onClose: fechar, onSave: salvar, onDelete: excluir },
  };
}
