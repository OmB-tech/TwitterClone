import './ConfirmationDialog.css';

const ConfirmationDialog = ({ isOpen, onCancel, onConfirm, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="dialog-backdrop">
            <div className="dialog-content">
                <p>{message}</p>
                <div className="dialog-buttons">
                    <button onClick={onCancel} className="dialog-btn cancel-btn">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="dialog-btn confirm-btn">
                        Yes, Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
