<?php

declare(strict_types=1);

namespace App\Model;

use PDO;

/**
 * Accès aux données des utilisateurs (CMD-c).
 *
 * Cette couche exécute les requêtes et renvoie des tableaux, sans règle de
 * présentation. Le hash du mot de passe n'est renvoyé que par
 * trouverParEmail(), qui sert uniquement à la vérification de connexion.
 */
final class UtilisateurModel
{
    /** Connexion à la base, fournie à la construction. */
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Cherche un utilisateur par son adresse e-mail, hash inclus.
     *
     * @param string $email Adresse saisie, liée par une requête préparée.
     * @return array{id: int, email: string, mot_de_passe_hash: string, nom: string, prenom: string, role: string}|null
     */
    public function trouverParEmail(string $email): ?array
    {
        $requete = $this->pdo->prepare(
            'SELECT id, email, mot_de_passe_hash, nom, prenom, role
               FROM utilisateur
              WHERE email = :email'
        );
        $requete->execute(['email' => $email]);
        $ligne = $requete->fetch();

        if ($ligne === false) {
            return null;
        }

        $ligne['id'] = (int) $ligne['id'];

        return $ligne;
    }

    /**
     * Cherche un utilisateur par son identifiant, sans le hash.
     *
     * @param int $id Identifiant lu dans la session serveur.
     * @return array{id: int, email: string, nom: string, prenom: string, role: string}|null
     */
    public function trouverParId(int $id): ?array
    {
        $requete = $this->pdo->prepare(
            'SELECT id, email, nom, prenom, role
               FROM utilisateur
              WHERE id = :id'
        );
        $requete->execute(['id' => $id]);
        $ligne = $requete->fetch();

        if ($ligne === false) {
            return null;
        }

        $ligne['id'] = (int) $ligne['id'];

        return $ligne;
    }

    /**
     * Indique si une adresse e-mail est déjà utilisée.
     *
     * @param string $email Adresse à tester.
     */
    public function emailExiste(string $email): bool
    {
        $requete = $this->pdo->prepare('SELECT COUNT(*) FROM utilisateur WHERE email = :email');
        $requete->execute(['email' => $email]);

        return (int) $requete->fetchColumn() > 0;
    }

    /**
     * Crée un compte client. Le rôle n'est jamais fourni par l'appelant.
     *
     * @param string $email Adresse e-mail, unique.
     * @param string $hash Hash produit par password_hash().
     * @param string $nom Nom de famille.
     * @param string $prenom Prénom.
     * @return int Identifiant du compte créé.
     */
    public function creer(string $email, string $hash, string $nom, string $prenom): int
    {
        $requete = $this->pdo->prepare(
            "INSERT INTO utilisateur (email, mot_de_passe_hash, nom, prenom, role)
             VALUES (:email, :hash, :nom, :prenom, 'client')"
        );
        $requete->execute([
            'email'  => $email,
            'hash'   => $hash,
            'nom'    => $nom,
            'prenom' => $prenom,
        ]);

        return (int) $this->pdo->lastInsertId();
    }
}
