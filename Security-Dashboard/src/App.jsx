
import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [logs, setLogs] = useState([]);

  useEffect(() => {

  const fetchLogs = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/security/logs"
      );

      console.log(
        "Fetched Logs:",
        response.data
      );

      setLogs(response.data);

    } catch (error) {

      console.error(
        "Error fetching logs:",
        error
      );

    }

  };

  // Initial fetch
  fetchLogs();

  // Auto refresh every 3 seconds
  const interval = setInterval(
    fetchLogs,
    3000
  );

  return () => clearInterval(
    interval
  );

}, []);

  const totalThreats = logs.filter(
    log => log.attackType
  ).length;

  const highSeverity = logs.filter(
    log => log.severity === "HIGH"
  ).length;

  const blockedRequests = logs.filter(
    log => log.attackType
  ).length;

  const attackCounts = {};

  logs.forEach(log => {

    if (!log.attackType) return;

    attackCounts[log.attackType] =
      (attackCounts[log.attackType] || 0) + 1;

  });

  const topAttackType =
    Object.keys(attackCounts).length > 0
      ? Object.keys(attackCounts).reduce(
          (a, b) =>
            attackCounts[a] > attackCounts[b]
              ? a
              : b
        )
      : "-";

  const styles = {

    page: {
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      padding: "25px",
      fontFamily: "Arial, sans-serif"
    },

    title: {
      fontSize: "40px",
      fontWeight: "bold",
      color: "#1e293b",
      marginBottom: "10px"
    },

    subtitle: {
      color: "#64748b",
      marginBottom: "30px"
    },

    cardContainer: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(220px,1fr))",
      gap: "20px",
      marginBottom: "30px"
    },

    card: {
      background: "white",
      padding: "20px",
      borderRadius: "15px",
      boxShadow:
        "0px 2px 8px rgba(0,0,0,0.1)"
    },

    cardTitle: {
      color: "#64748b",
      fontSize: "14px"
    },

    cardValue: {
      fontSize: "32px",
      fontWeight: "bold",
      marginTop: "10px"
    },

    tableBox: {
      background: "white",
      padding: "20px",
      borderRadius: "15px",
      boxShadow:
        "0px 2px 8px rgba(0,0,0,0.1)",
      overflowX: "auto"
    },

    table: {
      width: "100%",
      borderCollapse: "collapse"
    },

    th: {
      backgroundColor: "#e2e8f0",
      padding: "12px",
      textAlign: "left"
    },

    td: {
      padding: "12px",
      borderBottom:
        "1px solid #e2e8f0"
    },

    high: {
      backgroundColor: "#fee2e2",
      color: "#dc2626",
      padding: "5px 10px",
      borderRadius: "20px",
      fontWeight: "bold"
    },

    medium: {
      backgroundColor: "#fef3c7",
      color: "#d97706",
      padding: "5px 10px",
      borderRadius: "20px",
      fontWeight: "bold"
    },

    low: {
      backgroundColor: "#dcfce7",
      color: "#16a34a",
      padding: "5px 10px",
      borderRadius: "20px",
      fontWeight: "bold"
    }
  };

  return (

    <div style={styles.page}>

      <h1 style={styles.title}>
        AI WAF Security Dashboard
      </h1>

      <p style={styles.subtitle}>
        Explainable Threat Monitoring System
      </p>

      <div style={styles.cardContainer}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Total Threats
          </div>
          <div style={styles.cardValue}>
            {totalThreats}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            High Severity
          </div>
          <div
            style={{
              ...styles.cardValue,
              color: "red"
            }}
          >
            {highSeverity}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Blocked Requests
          </div>
          <div style={styles.cardValue}>
            {blockedRequests}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Top Attack Type
          </div>
          <div
            style={{
              ...styles.cardValue,
              color: "orange"
            }}
          >
            {topAttackType.toUpperCase()}
          </div>
        </div>

      </div>

      <div style={styles.tableBox}>

        <h2>
          Recent Threat Logs
        </h2>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                IP
              </th>

              <th style={styles.th}>
                Attack
              </th>

              <th style={styles.th}>
                Confidence
              </th>

              <th style={styles.th}>
                Severity
              </th>

              <th style={styles.th}>
                Explanation
              </th>

              <th style={styles.th}>
                Time
              </th>

            </tr>

          </thead>

          <tbody>

            {logs.map((log, index) => (

              <tr key={index}>

                <td style={styles.td}>
                  {log.ip || "-"}
                </td>

                <td style={styles.td}>
                  {log.attackType || "-"}
                </td>

                <td style={styles.td}>
                  {
                    log.confidence
                      ? `${(
                          log.confidence * 100
                        ).toFixed(2)}%`
                      : "-"
                  }
                </td>

                <td style={styles.td}>

                  <span
                    style={
                      log.severity === "HIGH"
                        ? styles.high
                        : log.severity === "MEDIUM"
                        ? styles.medium
                        : styles.low
                    }
                  >

                    {log.severity || "-"}

                  </span>

                </td>

                <td style={styles.td}>
                  {log.explanation || "-"}
                </td>

                <td style={styles.td}>

                  {
                    log.timestamp || log.time
                      ? new Date(
                          log.timestamp || log.time
                        ).toLocaleString()
                      : "-"
                  }

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default App;
