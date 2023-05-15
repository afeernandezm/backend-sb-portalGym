BEGIN;


CREATE TABLE IF NOT EXISTS public.cita
(
    id_cita integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 10000 CACHE 1 ),
    fecha_cita date NOT NULL,
    id_cliente integer NOT NULL,
    id_gym integer NOT NULL,
    hora_cita character varying(500) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Cita_pkey" PRIMARY KEY (id_cita)
);

CREATE TABLE IF NOT EXISTS public.cliente
(
    id_cliente integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 10000 CACHE 1 ),
    nombre_cliente character varying(100) COLLATE pg_catalog."default" NOT NULL,
    apellidos_cliente character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email_cliente character varying(100) COLLATE pg_catalog."default" NOT NULL,
    fnac_cliente date,
    "contraseña_cliente" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Cliente_pkey" PRIMARY KEY (id_cliente)
);

CREATE TABLE IF NOT EXISTS public.cliente_ejercicio
(
    id_cliente integer,
    id_ejercicio integer
);

CREATE TABLE IF NOT EXISTS public.ejercicio
(
    id_ejercicio integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 10000 CACHE 1 ),
    nombre_ejercicio character varying COLLATE pg_catalog."default" NOT NULL,
    series integer NOT NULL,
    repeticiones integer NOT NULL,
    CONSTRAINT "Ejercicio_pkey" PRIMARY KEY (id_ejercicio)
);

CREATE TABLE IF NOT EXISTS public.gimnasio
(
    id_gym integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 10000 CACHE 1 ),
    nombre_gym character varying(500) COLLATE pg_catalog."default" NOT NULL,
    imagen_gym bytea,
    email_gym character varying COLLATE pg_catalog."default" NOT NULL,
    direccion_gym character varying(500) COLLATE pg_catalog."default" NOT NULL,
    telefono character varying(50) COLLATE pg_catalog."default",
    id_responsable integer,
    CONSTRAINT "Gimnasio_pkey" PRIMARY KEY (id_gym)
);

CREATE TABLE IF NOT EXISTS public.responsable
(
    id_responsable integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 10000 CACHE 1 ),
    nombre_responsable character varying(500) COLLATE pg_catalog."default" NOT NULL,
    apellidos_responsable character varying(500) COLLATE pg_catalog."default" NOT NULL,
    email_responsable character varying(500) COLLATE pg_catalog."default" NOT NULL,
    telefono_responsable character varying(50) COLLATE pg_catalog."default",
    "contraseña_responsable" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Responsable_pkey" PRIMARY KEY (id_responsable)
);

ALTER TABLE IF EXISTS public.cita
    ADD CONSTRAINT id_cliente FOREIGN KEY (id_cliente)
    REFERENCES public.cliente (id_cliente) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.cita
    ADD CONSTRAINT id_gym FOREIGN KEY (id_gym)
    REFERENCES public.gimnasio (id_gym) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.cliente_ejercicio
    ADD CONSTRAINT "FK_id_ejercicio" FOREIGN KEY (id_ejercicio)
    REFERENCES public.ejercicio (id_ejercicio) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.cliente_ejercicio
    ADD CONSTRAINT "Fk_id_cliente" FOREIGN KEY (id_cliente)
    REFERENCES public.cliente (id_cliente) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.gimnasio
    ADD CONSTRAINT "FK_id_responsable" FOREIGN KEY (id_responsable)
    REFERENCES public.responsable (id_responsable) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;