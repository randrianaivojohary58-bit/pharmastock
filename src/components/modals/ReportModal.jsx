import Modal from './Modal';

export default function ReportModal({ isOpen, onClose, title, children }) {
  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={title} label="RAPPORT" maxWidth="max-w-5xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Fermer</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Imprimer</button>
        </>
      }
    >
      {children}
    </Modal>
  );
}