function AlertFloat({alert}) {
  return (
    <div className={alert.alertColor}>
        <p className="text-6xl">{alert.alertHeader}</p>
        <p className="text-3xl">{alert.alertBody}</p>
    </div>
  );
}

export default AlertFloat;
