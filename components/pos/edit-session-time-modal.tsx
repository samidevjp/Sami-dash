import React from 'react';
import { Modal } from '../ui/modal';

const listStyles =
  'w-[49%] text-center bg-secondary rounded-lg cursor-pointer py-2 px-8';
const sessionTimeList = [1, 1.5, 2, 2.5, 3, 3.5, 4];

interface EditSessionTimeModal {
  editSessionTimeOpen: boolean;
  setEditSessionTimeOpen: (flag: boolean) => void;
  selectedSessionTimeHandler: any;
  modalTitle: string;
}

const EditSessionTimeModal: React.FC<EditSessionTimeModal> = ({
  editSessionTimeOpen,
  setEditSessionTimeOpen,
  selectedSessionTimeHandler,
  modalTitle
}) => {
  return (
    <div>
      <Modal
        isOpen={editSessionTimeOpen}
        title={modalTitle}
        description=""
        onClose={() => setEditSessionTimeOpen(false)}
      >
        <div className="scrollable-container">
          <ul className="flex flex-wrap justify-between gap-2 text-center">
            {sessionTimeList.map((sessionTime) => {
              return (
                <li
                  className={listStyles}
                  key={Math.random()}
                  onClick={() => selectedSessionTimeHandler(sessionTime)}
                >
                  {sessionTime} Hr
                </li>
              );
            })}
            <li
              className={listStyles}
              onClick={() => selectedSessionTimeHandler()}
            >
              No Limit
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};
export default EditSessionTimeModal;
