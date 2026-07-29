Notas sobre la implmentación real de la aplicación (considero que es mejor hacerlo en un documento aparte
a la documentación final. La docu final la dejaré como ente descriptivo de los releases, varios elementos presentes
acá aparecerán en la documentación final.)

## Arquitectura
Monolito modular, con tres dominios independientes: "Metrics", "Streaming" y "On-demand".

## DataBase
[Esta es la estructura inicial de la base de datos del dominio Metrics.](./figs/metrics_db.pdf)