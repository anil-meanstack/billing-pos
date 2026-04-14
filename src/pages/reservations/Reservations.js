import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const reservations = [
  {
    id: "R001",
    status: "Confirmed",
    tag: "Anniversary",
    name: "Rahul Sharma",
    phone: "98765 43210",
    time: "1:00 PM",
    guests: 4,
    table: "Table 03",
    note: "Anniversary dinner — need candles & flowers",
    actions: ["Seat Now", "Edit", "Remind", "Cancel"],
  },
  {
    id: "R002",
    status: "Confirmed",
    tag: "Date Night",
    name: "Priya Singh",
    phone: "87654 32109",
    time: "7:30 PM",
    guests: 2,
    table: "Table 06",
    note: "Window seat preferred",
    actions: ["Seat Now", "Edit", "Remind", "Cancel"],
  },
  {
    id: "R003",
    status: "Pending",
    tag: "Birthday",
    name: "Amit Verma",
    phone: "76543 21098",
    time: "8:00 PM",
    guests: 6,
    table: "Table 09",
    note: "Birthday party — need cake arrangement",
    actions: ["Confirm", "Edit", "Remind", "Cancel"],
  },
];

const StatusBadge = ({ status }) => {
  const map = {
    Confirmed: "success",
    Pending: "warning",
  };
  return (
    <span className={`badge bg-${map[status]} me-2`}>
      {status}
    </span>
  );
};

const ActionButton = ({ label }) => {
  const styles = {
    "Seat Now": "btn-success",
    Confirm: "btn-warning",
    Edit: "btn-outline-secondary",
    Remind: "btn-outline-primary",
    Cancel: "btn-outline-danger",
  };
  return (
    <button className={`btn btn-sm me-2 ${styles[label]}`}>
      {label}
    </button>
  );
};

const ReservationCard = ({ data }) => (
  <div className="card mb-3 shadow-sm rounded-4">
    <div className="card-body">
      <div className="d-flex justify-content-between">
        <div>
          <StatusBadge status={data.status} />
          <span className="text-muted small">{data.tag}</span>
        </div>
        <span className="text-muted small">{data.id}</span>
      </div>

      <h5 className="mt-2 mb-1">{data.name}</h5>

      <div className="text-muted small mb-2">
        <i className="bi bi-telephone me-2"></i>{data.phone}
        <i className="bi bi-clock ms-3 me-2"></i>{data.time}
        <i className="bi bi-people ms-3 me-2"></i>{data.guests} guests
        <span className="ms-3">{data.table}</span>
      </div>

      <div className="bg-light p-2 rounded mb-3 small">
        {data.note}
      </div>

      <div>
        {data.actions.map((a, i) => (
          <ActionButton key={i} label={a} />
        ))}
      </div>
    </div>
  </div>
);

const Reservations = () => {
  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Reservations</h4>
          <small className="text-muted">6 reservations today</small>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button className="btn btn-warning text-white">
            <i className="bi bi-plus-circle me-1"></i> New Reservation
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card p-3 rounded-4">
            <h3>6</h3>
            <small className="text-muted">Total Reservations</small>
            <div className="text-success small">23 guests expected</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 rounded-4">
            <h3>4</h3>
            <small className="text-muted">Confirmed</small>
            <div className="text-success small">1 already seated · 1 pending</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 rounded-4">
            <h3>1</h3>
            <small className="text-muted">Awaiting Confirmation</small>
            <div className="text-danger small">Action required</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3">
        <button className="btn btn-warning me-2">All</button>
        <button className="btn btn-outline-secondary me-2">Confirmed</button>
        <button className="btn btn-outline-secondary me-2">Pending</button>
        <button className="btn btn-outline-secondary me-2">Seated</button>
        <button className="btn btn-outline-secondary">Cancelled</button>
      </div>

      {/* List */}
      {reservations.map((r) => (
        <ReservationCard key={r.id} data={r} />
      ))}
    </div>
  );
};

export default Reservations;